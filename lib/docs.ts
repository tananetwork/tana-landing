// Import pre-bundled docs for Cloudflare Workers compatibility
import bundledDocsData from './bundled-docs.json'

export interface DocMetadata {
  title: string
  description?: string
}

export interface DocFile {
  slug: string[]
  metadata: DocMetadata
  content: string
  html: string // Pre-compiled HTML from build time
}

export interface SidebarSection {
  label: string
  items: SidebarItem[]
}

export interface SidebarItem {
  label: string
  href: string
  items?: SidebarItem[]
}

export interface TableOfContentsItem {
  id: string
  text: string
  level: number
}

// Get all doc files from pre-bundled JSON
export function getAllDocs(): DocFile[] {
  return bundledDocsData as DocFile[]
}

// Get a single doc by slug
export function getDoc(slug: string[]): DocFile | null {
  const allDocs = getAllDocs()
  return allDocs.find(doc =>
    JSON.stringify(doc.slug) === JSON.stringify(slug)
  ) || null
}

// Generate sidebar structure from file system
export function generateSidebar(): SidebarSection[] {
  const allDocs = getAllDocs()

  // Create a flat structure organized by top-level category
  const categoryMap = new Map<string, SidebarItem[]>()

  for (const doc of allDocs) {
    if (doc.slug.length === 0) continue // Skip root index

    const category = doc.slug[0]
    const href = `/docs/${doc.slug.join('/')}`
    const label = doc.metadata.title || doc.slug[doc.slug.length - 1]

    if (!categoryMap.has(category)) {
      categoryMap.set(category, [])
    }

    categoryMap.get(category)!.push({ label, href })
  }

  // Map categories to sections with proper labels
  const sections: SidebarSection[] = []

  if (categoryMap.has('guides')) {
    sections.push({
      label: 'Guides',
      items: categoryMap.get('guides')!
    })
  }

  if (categoryMap.has('tana-api')) {
    sections.push({
      label: 'API Reference',
      items: categoryMap.get('tana-api')!
    })
  }

  if (categoryMap.has('tana-cli')) {
    sections.push({
      label: 'CLI',
      items: categoryMap.get('tana-cli')!
    })
  }

  if (categoryMap.has('tana-edge')) {
    sections.push({
      label: 'Edge Server',
      items: categoryMap.get('tana-edge')!
    })
  }

  if (categoryMap.has('tana-app')) {
    sections.push({
      label: 'Mobile App',
      items: categoryMap.get('tana-app')!
    })
  }

  if (categoryMap.has('contributing')) {
    sections.push({
      label: 'Contributing',
      items: categoryMap.get('contributing')!
    })
  }

  // Sort items within each section - prioritize intro/overview
  for (const section of sections) {
    section.items.sort((a, b) => {
      const aLabel = a.label.toLowerCase()
      const bLabel = b.label.toLowerCase()

      // Intro/Overview pages first
      if (aLabel.includes('intro') || aLabel.includes('overview')) return -1
      if (bLabel.includes('intro') || bLabel.includes('overview')) return 1

      // Then alphabetically
      return a.label.localeCompare(b.label)
    })
  }

  return sections
}

// Extract headings from markdown for table of contents
export function extractHeadings(content: string): TableOfContentsItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  const headings: TableOfContentsItem[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')

    headings.push({ id, text, level })
  }

  return headings
}
