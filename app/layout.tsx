import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'AI Resume Builder',
  description: 'Optimize, analyze, and enhance your resume with AI',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}


