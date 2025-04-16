'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Dashboard', href: '/' },
  { name: 'Estimates', href: '/estimates' },
  { name: 'Leads', href: '/leads' },
  { name: 'Customers', href: '/customers' },
  { name: 'Admin', href: '/admin' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <header className="md:hidden p-4 border-b flex items-center justify-between bg-white">
      <h1 className="text-lg font-bold">SCSD</h1>
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-4">
          <nav className="flex flex-col gap-4 mt-4">
            {navItems.map(({ name, href }) => (
              <Link
                key={name}
                href={href}
                className={cn(
                  'text-sm font-medium hover:underline',
                  pathname === href && 'text-primary underline'
                )}
              >
                {name}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  )
}
