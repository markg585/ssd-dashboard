// components/layout/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, FileText, Settings } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Estimates', href: '/estimates', icon: FileText },
  { name: 'Admin', href: '/admin', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:w-64 bg-white border-r h-screen sticky top-0 p-4 flex-col gap-4">
      <h1 className="text-lg font-bold mb-4">SCSD Dashboard</h1>
      <nav className="flex flex-col gap-2">
        {navItems.map(({ name, href, icon: Icon }) => (
          <Link
            key={name}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-all',
              pathname === href && 'bg-muted font-semibold'
            )}
          >
            <Icon className="w-4 h-4" />
            {name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
