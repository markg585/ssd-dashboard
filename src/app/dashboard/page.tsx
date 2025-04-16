"use client"

import { FileText, Users, Calendar } from "lucide-react"
import { DashboardCard } from "@/components/dashboard/DashboardCard"

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome to SCSD Dashboard</h1>
        <p className="text-muted-foreground mt-1">Quick snapshot of your jobs, customers, and estimates</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard title="Estimates" value="24" icon={<FileText className="w-6 h-6" />} />
        <DashboardCard title="Customers" value="17" icon={<Users className="w-6 h-6" />} />
        <DashboardCard title="Upcoming Jobs" value="5" icon={<Calendar className="w-6 h-6" />} />
      </div>

      {/* Placeholder for Recent Activity or Schedule */}
      <div className="rounded-lg border p-6 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
        <p className="text-sm text-muted-foreground">This section will show latest quotes, job updates, or new customers.</p>
      </div>
    </div>
  )
}
