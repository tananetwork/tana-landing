'use client'

import { useState } from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { DocsSidebar } from './DocsSidebar'
import { TableOfContents } from './TableOfContents'
import { SidebarSection, TableOfContentsItem } from '@/lib/docs'
import { Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DocsLayoutProps {
  children: React.ReactNode
  sidebar: SidebarSection[]
  headings: TableOfContentsItem[]
  slug: string[]
}

export function DocsLayout({ children, sidebar, headings, slug }: DocsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen bg-background text-foreground overflow-hidden flex flex-col">
      <Navbar />

      {/* Mobile header with menu toggle and search */}
      <div className="md:hidden sticky top-16 z-40 bg-background border-b border-border p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex-1 mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search docs..."
              className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Three-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Navigation */}
        <DocsSidebar sections={sidebar} isOpen={sidebarOpen} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide bg-secondary/30">
          <div className="max-w-4xl mx-auto px-8 py-12">
            {children}
          </div>
        </main>

        {/* Right Panel - Table of Contents or Search */}
        <aside className="hidden xl:block w-64 overflow-y-auto scrollbar-hide border-l border-border/30">
          <div className="sticky top-4 p-4">
            {/* Search bar at top */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search docs..."
                  className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Table of Contents */}
            {headings.length > 0 && (
              <>
                <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                  On This Page
                </h4>
                <nav>
                  <ul className="space-y-2">
                    {headings.map(({ id, text, level }) => (
                      <li
                        key={id}
                        className={level === 3 ? 'ml-4' : ''}
                      >
                        <a
                          href={`#${id}`}
                          className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                          onClick={(e) => {
                            e.preventDefault()
                            document.getElementById(id)?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start'
                            })
                          }}
                        >
                          {text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
