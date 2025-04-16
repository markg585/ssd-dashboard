'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  FileText,
  Settings,
  Users,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Estimates', href: '/estimates', icon: FileText },
  { name: 'Customers', href: '/customers', icon: Users }, // ✅ New nav item
  { name: 'Admin', href: '/admin', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Logged out');
    router.push('/login');
  };

  return (
    <aside className="hidden md:flex md:w-64 bg-white border-r h-screen sticky top-0 p-4 flex-col justify-between">
      <div className="flex flex-col gap-4">
        <h1 className="text-lg font-bold mb-2">SCSD Dashboard</h1>
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
      </div>

      <div className="mt-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </aside>
  );
}


