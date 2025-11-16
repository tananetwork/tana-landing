'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, X, LogIn, User } from 'lucide-react'
import { useUser } from '@/context/user-context'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { user, isLoading } = useUser()

  const navigation = [
    { name: 'Features', href: '#features' },
    { name: 'Documentation', href: '#docs' },
    { name: 'Examples', href: '#examples' },
  ]

  return (
    <nav className="sticky top-0 z-50 px-4 py-6 lg:px-8 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary border border-primary/30 flex items-center justify-center transform rotate-45">
                <div className="w-3 h-3 bg-background transform -rotate-45"></div>
              </div>
              <span className="text-xl font-bold text-primary">tana</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
            {!isLoading && (
              <>
                {user ? (
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/30 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    {user.username}
                  </Button>
                ) : (
                  <Button
                    onClick={() => router.push('/login')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/30 flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              {!isLoading && (
                <>
                  {user ? (
                    <Button
                      onClick={() => {
                        setIsOpen(false)
                        router.push('/dashboard')
                      }}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/30 w-full flex items-center justify-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      {user.username}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setIsOpen(false)
                        router.push('/login')
                      }}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/30 w-full flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      Login
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}