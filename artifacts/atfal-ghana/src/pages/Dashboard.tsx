import { useGetAnalyticsSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, GraduationCap, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: summary, isLoading } = useGetAnalyticsSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">National Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of Majlis Atfal-ul-Ahmadiyya Ghana</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Members"
          value={summary?.totalMembers}
          icon={Users}
          isLoading={isLoading}
        />
        <MetricCard
          title="New This Month"
          value={summary?.newThisMonth}
          icon={UserPlus}
          isLoading={isLoading}
        />
        <MetricCard
          title="Graduations This Month"
          value={summary?.graduationsThisMonth}
          icon={GraduationCap}
          isLoading={isLoading}
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <AlertCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Healthy</div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholders for charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2 min-h-[300px] flex items-center justify-center bg-muted/20">
          <p className="text-muted-foreground">Sector Breakdown Chart</p>
        </Card>
        <Card className="min-h-[300px] flex items-center justify-center bg-muted/20">
          <p className="text-muted-foreground">Wing Distribution</p>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, isLoading }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value?.toLocaleString()}</div>
        )}
      </CardContent>
    </Card>
  );
}
