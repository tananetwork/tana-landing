'use client'

import { UserProvider } from "@/context/user-context"
import { ThemeProvider } from "@/context/theme-context"
import { DebugTools } from "@/components/DebugTools"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <UserProvider>
        {children}
      </UserProvider>
      <DebugTools />
    </ThemeProvider>
  )
}
