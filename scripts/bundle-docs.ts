#!/usr/bin/env bun
/**
 * Pre-bundle all docs markdown files into a static JSON file
 * for Cloudflare Workers compatibility (no runtime filesystem access)
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface DocMetadata {
  title: string
  description?: string
}

interface DocFile {
  slug: string[]
  metadata: DocMetadata
  content: string
}

const docsDirectory = path.join(process.cwd(), 'content/docs')
const outputPath = path.join(process.cwd(), 'lib/bundled-docs.json')

function getAllDocs(): DocFile[] {
  const docs: DocFile[] = []

  function readDir(dir: string, slugParts: string[] = []) {
    const files = fs.readdirSync(dir)

    for (const file of files) {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        readDir(filePath, [...slugParts, file])
      } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const fileContents = fs.readFileSync(filePath, 'utf8')
        const { data, content } = matter(fileContents)

        const fileName = file.replace(/\.mdx?$/, '')
        const slug = fileName === 'index' ? slugParts : [...slugParts, fileName]

        docs.push({
          slug,
          metadata: data as DocMetadata,
          content,
        })
      }
    }
  }

  readDir(docsDirectory)
  return docs
}

// Generate the bundle
console.log('📦 Bundling docs...')
const docs = getAllDocs()
const bundleContent = JSON.stringify(docs, null, 2)

// Write to output file
fs.writeFileSync(outputPath, bundleContent, 'utf8')

console.log(`✅ Bundled ${docs.length} docs to ${outputPath}`)
console.log(`📊 Bundle size: ${(bundleContent.length / 1024).toFixed(2)} KB`)
