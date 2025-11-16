import "./globals.css"
import type { Metadata } from "next"
import { ClientLayout } from "@/components/ClientLayout"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Tana - User-owned blockchain with TypeScript smart contracts",
  description: "A blockchain platform designed to be user-owned and operated. Write smart contracts in TypeScript and execute them in a sandboxed V8 environment."
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}