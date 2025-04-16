import { Card, CardContent } from "@/components/ui/card"

export function DashboardCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string | number
  icon?: React.ReactNode
}) {
  return (
    <Card className="transition hover:shadow-md shadow-sm border border-gray-200">
      <CardContent className="flex items-center justify-between p-5 sm:p-6">
        <div>
          <p className="text-muted-foreground text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-muted-foreground flex items-center">{icon}</div>
      </CardContent>
    </Card>
  )
}
