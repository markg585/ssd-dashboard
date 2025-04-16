import './globals.css'
import { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { Toaster } from '@/components/ui/sonner'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-muted text-foreground">
        
        {/* ✅ Mobile Nav – visible on small screens, hidden on print */}
        <div className="md:hidden print:hidden">
          <MobileNav />
          <main className="p-4">{children}</main>
        </div>

        {/* ✅ Desktop Sidebar Layout – visible on desktop, sidebar hidden on print */}
        <div className="hidden md:flex print:flex">
          <aside className="print:hidden">
            <Sidebar />
          </aside>
          <main className="flex-1 p-6">{children}</main>
        </div>

        {/* ✅ Toasts still allowed on screen, won’t affect print */}
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}

