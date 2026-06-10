import { useGetAnalyticsSummary, useGetAnalyticsBySector, useGetUpcomingGraduations } from "@workspace/api-client-react";
import { Users, UserPlus, GraduationCap, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import { MemberAvatar } from "@/components/members/MemberAvatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

const WING_COLORS = {
  atfal_sughir: "#0ea5e9",
  atfal_kabir:  "#10b981",
  khuddam:      "#f59e0b",
};

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetAnalyticsSummary();
  const { data: sectorData, isLoading: isLoadingSector } = useGetAnalyticsBySector();
  const { data: gradData, isLoading: isLoadingGrads } = useGetUpcomingGraduations();

  const pieData = summary ? [
    { name: "Sughir",   value: summary.atfalSughirCount, fill: WING_COLORS.atfal_sughir },
    { name: "Kabir",    value: summary.atfalKabirCount,  fill: WING_COLORS.atfal_kabir  },
    { name: "Khuddam",  value: summary.khuddamCount,     fill: WING_COLORS.khuddam      },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="National Dashboard"
        subtitle="Overview of Majlis Atfal-ul-Ahmadiyya Ghana"
      />

      {/* Stat row 1 */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Members"
          value={summary?.totalMembers}
          icon={Users}
          isLoading={isLoadingSummary}
        />
        <StatCard
          title="Atfal Sughir"
          value={summary?.atfalSughirCount}
          icon={Users}
          isLoading={isLoadingSummary}
          className="border-sky-200 dark:border-sky-900 bg-sky-50/30 dark:bg-sky-950/20"
        />
        <StatCard
          title="Atfal Kabir"
          value={summary?.atfalKabirCount}
          icon={Users}
          isLoading={isLoadingSummary}
          className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20"
        />
        <StatCard
          title="Khuddam"
          value={summary?.khuddamCount}
          icon={Users}
          isLoading={isLoadingSummary}
          className="border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20"
        />
      </div>

      {/* Stat row 2 */}
      <div className="grid gap-4 grid-cols-2">
        <StatCard
          title="New This Month"
          value={summary?.newThisMonth}
          icon={UserPlus}
          isLoading={isLoadingSummary}
        />
        <StatCard
          title="Graduations This Month"
          value={summary?.graduationsThisMonth}
          icon={GraduationCap}
          isLoading={isLoadingSummary}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Sector Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSector ? (
              <Skeleton className="w-full h-[300px]" />
            ) : sectorData && sectorData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="sector" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <RechartsTooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-border)" }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                    <Bar dataKey="atfalSughir" name="Atfal Sughir" fill={WING_COLORS.atfal_sughir} radius={[4,4,0,0]} maxBarSize={40} />
                    <Bar dataKey="atfalKabir"  name="Atfal Kabir"  fill={WING_COLORS.atfal_kabir}  radius={[4,4,0,0]} maxBarSize={40} />
                    <Bar dataKey="khuddam"     name="Khuddam"      fill={WING_COLORS.khuddam}       radius={[4,4,0,0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wing Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="w-full h-[300px]" />
            ) : pieData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-border)" }} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Graduations */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          <CardTitle>Upcoming Graduations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingGrads ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : gradData ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Turning 15 this month</p>
              {gradData.thisMonth && gradData.thisMonth.length > 0 ? (
                <div className="space-y-2">
                  {gradData.thisMonth.map(m => (
                    <Link key={m.id} href={`/members/${m.id}`}>
                      <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border">
                        <MemberAvatar member={m} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{m.firstName} {m.lastName}</p>
                          <p className="text-xs text-muted-foreground truncate">{m.zone} · {m.jamaat}</p>
                        </div>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900 shrink-0">
                          {new Date(m.dateOfBirth).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground bg-muted/20 rounded-md border border-dashed">
                  No graduations this month
                </div>
              )}

              {gradData.thisMonth?.length === 0 && gradData.thisQuarter && gradData.thisQuarter.length > 0 && (
                <p className="text-sm text-muted-foreground pt-2">
                  {gradData.thisQuarter.length} member{gradData.thisQuarter.length !== 1 ? "s" : ""} will turn 15 in the next 3 months.
                </p>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
