import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Stat {
  title: string
  value: number
}

interface DashboardStatsProps {
  stats: Stat[]
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
