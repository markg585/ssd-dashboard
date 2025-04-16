'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  if (isLogin) {
    return <main className="min-h-screen flex items-center justify-center">{children}</main>;
  }

  return (
    <>
      <div className="md:hidden print:hidden">
        <MobileNav />
        <main className="p-4">{children}</main>
      </div>

      <div className="hidden md:flex print:flex">
        <aside className="print:hidden">
          <Sidebar />
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </>
  );
}
