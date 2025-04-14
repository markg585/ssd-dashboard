// src/app/page.tsx
import { MobileNav } from '@/components/layout/MobileNav'

export default function DashboardPage() {
  return (
    <div className="flex-1">
      <MobileNav />
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Welcome to SCSD Dashboard</h1>
        <p className="text-muted-foreground">
          Select a section from the sidebar to get started.
        </p>

        <div className="bg-red-500 text-white p-4 rounded-md">
          If this is red, Tailwind is working ✅
        </div>
      </main>
    </div>
  )
}
