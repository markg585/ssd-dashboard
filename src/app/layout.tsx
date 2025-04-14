// src/app/layout.tsx
import './globals.css'
import { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { Toaster } from '@/components/ui/sonner' // 👈 import toast

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-muted text-foreground">
        {/* Mobile Nav - only visible below md */}
        <div className="md:hidden">
          <MobileNav />
          <main className="p-4">{children}</main>
        </div>

        {/* Desktop Sidebar + Main Layout */}
        <div className="hidden md:flex">
          <Sidebar />
          <main className="flex-1 p-6">{children}</main>
        </div>

        {/* ✅ Sonner Toast */}
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
