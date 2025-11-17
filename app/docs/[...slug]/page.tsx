import { notFound } from 'next/navigation'
import { getAllDocs, getDoc, generateSidebar, extractHeadings } from '@/lib/docs'
import { DocsLayout } from '@/components/docs/DocsLayout'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { mdxComponents } from '@/mdx-components'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'

// Force static generation for Cloudflare Workers
export const dynamic = 'force-static'
export const dynamicParams = false

// Generate static params for all docs
export async function generateStaticParams() {
  const docs = getAllDocs()

  return docs
    .filter((doc) => doc.slug.length > 0) // Filter out root index (handled by /docs/page.tsx)
    .map((doc) => ({
      slug: doc.slug,
    }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const doc = getDoc(slug)

  if (!doc) {
    return {
      title: 'Page Not Found',
    }
  }

  return {
    title: `${doc.metadata.title} | tana Docs`,
    description: doc.metadata.description || `Documentation for ${doc.metadata.title}`,
  }
}

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const doc = getDoc(slug)

  if (!doc) {
    notFound()
  }

  const sidebar = generateSidebar()
  const headings = extractHeadings(doc.content)

  return (
    <DocsLayout sidebar={sidebar} headings={headings} slug={slug}>
      <article className="prose prose-lg prose-invert max-w-none">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          {doc.metadata.title}
        </h1>
        {doc.metadata.description && (
          <p className="text-xl text-muted-foreground mb-8">
            {doc.metadata.description}
          </p>
        )}

        <div className="docs-content">
          <MDXRemote
            source={doc.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  rehypeSlug,
                  [
                    rehypePrettyCode,
                    {
                      theme: 'github-dark',
                      keepBackground: false,
                    },
                  ],
                  [
                    rehypeAutolinkHeadings,
                    {
                      behavior: 'wrap',
                      properties: {
                        className: ['anchor'],
                      },
                    },
                  ],
                ],
              },
            }}
          />
        </div>
      </article>
    </DocsLayout>
  )
}
