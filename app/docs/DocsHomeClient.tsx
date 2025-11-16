'use client'

import { useState } from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { DocsSidebar } from '@/components/docs/DocsSidebar'
import { Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SidebarSection } from '@/lib/docs'

interface DocsHomeClientProps {
  sections: SidebarSection[]
}

export function DocsHomeClient({ sections }: DocsHomeClientProps) {
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
        {/* Left Sidebar */}
        <DocsSidebar sections={sections} isOpen={sidebarOpen} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide bg-secondary/30">
          <article className="max-w-4xl mx-auto px-8 py-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Welcome to tana
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              tana is a blockchain platform with TypeScript smart contracts. Anyone can start their own blockchain or join existing networks as validators.
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-12">
              <Link href="/docs/guides/quickstart">
                <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-all bg-card">
                  <h3 className="text-xl font-bold text-foreground mb-2">Quick Start</h3>
                  <p className="text-muted-foreground text-sm">
                    Deploy your first smart contract in 5 minutes
                  </p>
                </div>
              </Link>

              <Link href="/docs/tana-cli/commands">
                <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-all bg-card">
                  <h3 className="text-xl font-bold text-foreground mb-2">CLI Reference</h3>
                  <p className="text-muted-foreground text-sm">
                    Learn the command-line interface
                  </p>
                </div>
              </Link>

              <Link href="/docs/tana-api/intro">
                <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-all bg-card">
                  <h3 className="text-xl font-bold text-foreground mb-2">API Reference</h3>
                  <p className="text-muted-foreground text-sm">
                    Explore the REST API endpoints
                  </p>
                </div>
              </Link>

              <Link href="/docs/contributing/setup">
                <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-all bg-card">
                  <h3 className="text-xl font-bold text-foreground mb-2">Contributing</h3>
                  <p className="text-muted-foreground text-sm">
                    Help build tana
                  </p>
                </div>
              </Link>
            </div>

            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">Key Features</h2>

            <h3 className="text-2xl font-bold text-foreground mt-6 mb-3">TypeScript Smart Contracts</h3>
            <p className="text-muted-foreground mb-4">
              Write contracts in familiar TypeScript with full type safety and IDE support. No new language to learn.
            </p>

            <h3 className="text-2xl font-bold text-foreground mt-6 mb-3">Multi-Currency Support</h3>
            <p className="text-muted-foreground mb-4">
              No native token required. Create and manage any currency in your contracts.
            </p>

            <h3 className="text-2xl font-bold text-foreground mt-6 mb-3">CLI-First Design</h3>
            <p className="text-muted-foreground mb-4">
              Everything controllable from the terminal with powerful command-line tools.
            </p>
          </article>
        </main>

        {/* Right Panel - Search placeholder on desktop */}
        <aside className="hidden xl:block w-64 overflow-y-auto scrollbar-hide border-l border-border/30">
          <div className="sticky top-20 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search docs..."
                className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
