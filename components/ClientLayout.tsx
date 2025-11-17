'use client'

import { UserProvider } from "@/context/user-context"
import { ThemeProvider } from "@/context/theme-context"
import { DebugTools } from "@/components/DebugTools"
import { MonacoLoader } from "@/components/MonacoLoader"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <MonacoLoader />
        {children}
      </UserProvider>
      <DebugTools />
    </ThemeProvider>
  )
}
