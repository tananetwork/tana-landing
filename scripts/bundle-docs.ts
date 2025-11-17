#!/usr/bin/env bun
/**
 * Pre-bundle all docs markdown files into a static JSON file
 * for Cloudflare Workers compatibility (no runtime filesystem access)
 *
 * Pre-compiles markdown to HTML at build time to avoid runtime MDX processing
 * which is incompatible with Cloudflare Workers
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import { gfmHeadingId } from 'marked-gfm-heading-id'
import { createHighlighter } from 'shiki'

interface DocMetadata {
  title: string
  description?: string
}

interface TableOfContentsItem {
  id: string
  text: string
  level: number
}

interface DocFile {
  slug: string[]
  metadata: DocMetadata
  content: string
  html: string // Pre-compiled HTML
  codeBlocks: Array<{lang: string, code: string}> // Extracted code blocks for Monaco
  tableOfContents: TableOfContentsItem[] // Pre-computed TOC
}

const docsDirectory = path.join(process.cwd(), 'content/docs')
const outputPath = path.join(process.cwd(), 'lib/bundled-docs.json')

// Initialize Shiki highlighter
const highlighter = await createHighlighter({
  themes: ['github-dark'],
  langs: ['typescript', 'javascript', 'bash', 'json', 'markdown', 'html', 'css'],
})

// Configure marked with syntax highlighting from Shiki
const marked = new Marked(gfmHeadingId())

// Enable GFM (GitHub Flavored Markdown) and HTML processing
marked.setOptions({
  gfm: true,
  breaks: false,
})

// Post-process HTML to handle markdown inside tables and add IDs to API methods
async function postProcessHtml(html: string): Promise<string> {
  let processed = html

  // Process markdown formatting inside table cells
  processed = processed.replace(/<td>(.*?)<\/td>/g, (match, content) => {
    // Replace **text** with <strong>text</strong>
    let cellContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Replace _text_ with <em>$1</em>
    cellContent = cellContent.replace(/_(.*?)_/g, '<em>$1</em>')
    return `<td>${cellContent}</td>`
  })

  // Add IDs to API method details elements for table of contents linking
  processed = processed.replace(
    /<details>(\s*<summary>\s*<code[^>]*>(GET|POST|PUT|DELETE|PATCH)<\/code>\s*<code[^>]*><b>([^<]+)<\/b><\/code>)/g,
    (match, summaryPart, method, endpoint) => {
      const id = endpoint
        .toLowerCase()
        .replace(/^\//, '')
        .replace(/[/:]/g, '-')
        .replace(/[^a-z0-9-]/g, '')
      return `<details id="${id}">${summaryPart}`
    }
  )

  return processed
}

// Extract table of contents from HTML
function extractTableOfContents(html: string, content: string): TableOfContentsItem[] {
  const toc: TableOfContentsItem[] = []

  // For API reference pages, extract methods from <details><summary> tags
  if (html.includes('<details>')) {
    const summaryRegex = /<summary>\s*<code[^>]*>(GET|POST|PUT|DELETE|PATCH)<\/code>\s*<code[^>]*><b>([^<]+)<\/b><\/code>/g
    let match

    while ((match = summaryRegex.exec(html)) !== null) {
      const method = match[1]
      const endpoint = match[2]
      const text = `${method} ${endpoint}`
      const id = endpoint
        .toLowerCase()
        .replace(/^\//, '')
        .replace(/[/:]/g, '-')
        .replace(/[^a-z0-9-]/g, '')

      toc.push({ id, text, level: 2 })
    }
  }

  // Extract top-level headings (H2 and H3) that are NOT inside <details> tags
  // Split content by <details> to exclude content inside them
  const detailsRegex = /<details>[\s\S]*?<\/details>/g
  const contentWithoutDetails = content.replace(detailsRegex, '')

  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  let match

  while ((match = headingRegex.exec(contentWithoutDetails)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')

    toc.push({ id, text, level })
  }

  return toc
}

// Use Shiki for code highlighting with proper HTML output
marked.use({
  async: true,
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const language = lang || 'text'
      try {
        const html = highlighter.codeToHtml(text, {
          lang: language,
          theme: 'github-dark',
        })
        // Add data-language attribute and line-numbers class for CSS counters
        return html.replace('<pre class="shiki', `<pre data-language="${language}" class="shiki line-numbers`)
      } catch (e) {
        // Fallback for unsupported languages
        return `<pre data-language="${language}" class="shiki github-dark"><code>${text}</code></pre>`
      }
    },
  },
})

async function convertToHtml(content: string): Promise<string> {
  try {
    const html = await marked.parse(content)
    const processedHtml = await postProcessHtml(html as string)
    return processedHtml
  } catch (error) {
    console.error('Error converting markdown:', error)
    return `<p>Error rendering content</p>`
  }
}

async function getAllDocs(): Promise<DocFile[]> {
  const docs: DocFile[] = []

  async function readDir(dir: string, slugParts: string[] = []) {
    const files = fs.readdirSync(dir)

    for (const file of files) {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        await readDir(filePath, [...slugParts, file])
      } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const fileContents = fs.readFileSync(filePath, 'utf8')
        const { data, content } = matter(fileContents)

        const fileName = file.replace(/\.mdx?$/, '')
        const slug = fileName === 'index' ? slugParts : [...slugParts, fileName]

        // Fix JSX className -> class for HTML compatibility
        const preprocessedContent = content.replace(/className=/g, 'class=')

        // Extract code blocks before HTML conversion
        const codeBlocks: Array<{lang: string, code: string}> = []
        const contentWithPlaceholders = preprocessedContent.replace(/```(\w+)\n([\s\S]*?)```/g, (match, lang, code) => {
          const index = codeBlocks.length
          codeBlocks.push({ lang, code: code.trim() })
          // Use a div to prevent markdown from wrapping it in <p>
          return `\n\n<div class="code-block-placeholder" data-index="${index}" data-lang="${lang}"></div>\n\n`
        })

        // Convert markdown to HTML at build time
        const html = await convertToHtml(contentWithPlaceholders)

        // Extract table of contents at build time
        const tableOfContents = extractTableOfContents(html, content)

        docs.push({
          slug,
          metadata: data as DocMetadata,
          content, // Keep original for search/indexing
          html,
          codeBlocks, // Store code blocks separately for Monaco rendering
          tableOfContents, // Pre-computed TOC
        })
      }
    }
  }

  await readDir(docsDirectory)
  return docs
}

// Generate the bundle
console.log('📦 Bundling docs...')
const docs = await getAllDocs()
const bundleContent = JSON.stringify(docs, null, 2)

// Write to output file
fs.writeFileSync(outputPath, bundleContent, 'utf8')

console.log(`✅ Bundled ${docs.length} docs to ${outputPath}`)
console.log(`📊 Bundle size: ${(bundleContent.length / 1024).toFixed(2)} KB`)
