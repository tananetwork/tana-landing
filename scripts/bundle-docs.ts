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

interface DocFile {
  slug: string[]
  metadata: DocMetadata
  content: string
  html: string // Pre-compiled HTML
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

// Enable GFM (GitHub Flavored Markdown)
marked.setOptions({
  gfm: true,
  breaks: false,
})

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
        // Add data-language attribute for the language badge
        return html.replace('<pre class="shiki', `<pre data-language="${language}" class="shiki`)
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
    return html as string
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

        // Convert markdown to HTML at build time
        const html = await convertToHtml(content)

        docs.push({
          slug,
          metadata: data as DocMetadata,
          content, // Keep original for search/indexing
          html,
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
