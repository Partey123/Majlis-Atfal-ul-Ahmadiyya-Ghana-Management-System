import {
  useGetAnalyticsSummary,
  useGetAnalyticsBySector,
  useGetAnalyticsByRegion,
  useGetBirthdayAnalytics,
} from "@workspace/api-client-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { MemberAvatar } from "@/components/members/MemberAvatar";
import { WingBadge } from "@/components/members/WingBadge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Users, UserPlus, GraduationCap, Cake } from "lucide-react";

const WING_COLORS = {
  atfalSughir: "#0ea5e9",
  atfalKabir: "#10b981",
  khuddam: "#f59e0b",
};

const SECTOR_LABELS: Record<string, string> = {
  "Northern Sector": "Northern",
  "Middle Sector": "Middle",
  "Southern Sector": "Southern",
};

type SectorKey = "all" | "Northern Sector" | "Middle Sector" | "Southern Sector";

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Analytics() {
  const [sectorFilter, setSectorFilter] = useState<SectorKey>("all");

  const { data: summary, isLoading: loadingSummary } = useGetAnalyticsSummary();
  const { data: sectorData, isLoading: loadingSector } = useGetAnalyticsBySector();
  const { data: regionData, isLoading: loadingRegion } = useGetAnalyticsByRegion(
    sectorFilter !== "all" ? { sector: sectorFilter } : {}
  );
  const { data: bdayData, isLoading: loadingBdays } = useGetBirthdayAnalytics();

  const pieData = summary
    ? [
        { name: "Atfal Sughir", value: summary.atfalSughirCount, fill: WING_COLORS.atfalSughir },
        { name: "Atfal Kabir", value: summary.atfalKabirCount, fill: WING_COLORS.atfalKabir },
        { name: "Khuddam", value: summary.khuddamCount, fill: WING_COLORS.khuddam },
      ].filter((d) => d.value > 0)
    : [];

  const chartData = sectorData?.map((s) => ({
    ...s,
    sector: SECTOR_LABELS[s.sector] ?? s.sector,
  }));

  return (
    <div className="space-y-10 pb-12">
      <PageHeader
        title="Analytics"
        subtitle="National statistics, regional breakdowns, and membership trends"
      />

      {/* ── Section 1: Summary stats ── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          National Overview
        </h2>
        <motion.div
          className="grid gap-4 grid-cols-2 lg:grid-cols-4"
          variants={STAGGER}
          initial="hidden"
          animate="show"
        >
          {[
            { title: "Total Members", value: summary?.totalMembers, icon: Users },
            { title: "Atfal Sughir", value: summary?.atfalSughirCount, icon: Users, className: "border-sky-200 bg-sky-50/40 dark:border-sky-900 dark:bg-sky-950/20" },
            { title: "Atfal Kabir", value: summary?.atfalKabirCount, icon: Users, className: "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20" },
            { title: "Khuddam", value: summary?.khuddamCount, icon: Users, className: "border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20" },
            { title: "New This Month", value: summary?.newThisMonth, icon: UserPlus },
            { title: "Graduations This Month", value: summary?.graduationsThisMonth, icon: GraduationCap },
          ].map((card) => (
            <motion.div key={card.title} variants={FADE_UP}>
              <StatCard
                title={card.title}
                value={card.value}
                icon={card.icon}
                isLoading={loadingSummary}
                className={card.className}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Section 2: Sector Analysis ── */}
      <section className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Sector Analysis
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Wing Distribution by Sector</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSector ? (
                <Skeleton className="h-[280px] w-full" />
              ) : !chartData || chartData.length === 0 ? (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">No data available</div>
              ) : (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                      <XAxis dataKey="sector" tickLine={false} axisLine={false} tick={{ fontSize: 13 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: "10px", border: "1px solid var(--color-border)", fontSize: "13px" }}
                        cursor={{ fill: "rgba(0,0,0,0.04)" }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: "16px", fontSize: "13px" }} />
                      <Bar dataKey="atfalSughir" name="Atfal Sughir" fill={WING_COLORS.atfalSughir} radius={[4, 4, 0, 0]} maxBarSize={36} />
                      <Bar dataKey="atfalKabir" name="Atfal Kabir" fill={WING_COLORS.atfalKabir} radius={[4, 4, 0, 0]} maxBarSize={36} />
                      <Bar dataKey="khuddam" name="Khuddam" fill={WING_COLORS.khuddam} radius={[4, 4, 0, 0]} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Wing Composition</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <Skeleton className="h-[280px] w-full" />
              ) : (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="45%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid var(--color-border)", fontSize: "13px" }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: "13px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sector summary cards */}
        {!loadingSector && sectorData && (
          <div className="grid gap-4 md:grid-cols-3">
            {sectorData.map((s) => {
              const total = s.totalMembers || 1;
              return (
                <Card key={s.sector} className="overflow-hidden">
                  <CardHeader className="pb-3 border-b bg-muted/20">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">{s.sector}</CardTitle>
                      <span className="text-2xl font-bold tabular-nums">{s.totalMembers}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {[
                      { label: "Atfal Sughir", count: s.atfalSughir, color: "#0ea5e9" },
                      { label: "Atfal Kabir", count: s.atfalKabir, color: "#10b981" },
                      { label: "Khuddam", count: s.khuddam, color: "#f59e0b" },
                    ].map((row) => (
                      <div key={row.label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{row.label}</span>
                          <span className="font-medium tabular-nums">{row.count}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(row.count / total) * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: row.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Section 3: Regional Breakdown ── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Regional Breakdown
          </h2>
          <div className="flex gap-2 flex-wrap">
            {(["all", "Northern Sector", "Middle Sector", "Southern Sector"] as SectorKey[]).map((s) => (
              <button
                key={s}
                onClick={() => setSectorFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  sectorFilter === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {s === "all" ? "All Regions" : s.replace(" Sector", "")}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Region</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Sector</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-sky-600 uppercase tracking-wider hidden md:table-cell">Sughir</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-emerald-600 uppercase tracking-wider hidden md:table-cell">Kabir</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-amber-600 uppercase tracking-wider hidden md:table-cell">Khuddam</th>
                  <th className="px-4 py-3 hidden lg:table-cell w-40">Distribution</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loadingRegion ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : regionData && regionData.length > 0 ? (
                  regionData
                    .sort((a, b) => b.totalMembers - a.totalMembers)
                    .map((r) => {
                      const total = r.totalMembers || 1;
                      return (
                        <tr key={r.region} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-medium">{r.region}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">
                            {r.sector.replace(" Sector", "")}
                          </td>
                          <td className="px-4 py-3 text-right font-bold tabular-nums">{r.totalMembers}</td>
                          <td className="px-4 py-3 text-right text-sky-600 tabular-nums hidden md:table-cell">{r.atfalSughir}</td>
                          <td className="px-4 py-3 text-right text-emerald-600 tabular-nums hidden md:table-cell">{r.atfalKabir}</td>
                          <td className="px-4 py-3 text-right text-amber-600 tabular-nums hidden md:table-cell">{r.khuddam}</td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <div className="flex h-2 rounded-full overflow-hidden gap-px w-40">
                              {r.atfalSughir > 0 && (
                                <div style={{ width: `${(r.atfalSughir / total) * 100}%`, backgroundColor: WING_COLORS.atfalSughir }} className="rounded-l-full" />
                              )}
                              {r.atfalKabir > 0 && (
                                <div style={{ width: `${(r.atfalKabir / total) * 100}%`, backgroundColor: WING_COLORS.atfalKabir }} />
                              )}
                              {r.khuddam > 0 && (
                                <div style={{ width: `${(r.khuddam / total) * 100}%`, backgroundColor: WING_COLORS.khuddam }} className="rounded-r-full" />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      No regional data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* ── Section 4: Birthday Analytics ── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Birthday Analytics
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { key: "today", label: "Today", members: bdayData?.today ?? [] },
            { key: "thisWeek", label: "This Week", members: bdayData?.thisWeek ?? [] },
            { key: "thisMonth", label: "This Month", members: bdayData?.thisMonth ?? [] },
          ].map(({ key, label, members }) => (
            <Card key={key}>
              <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Cake className="h-4 w-4 text-primary" /> {label}
                  </CardTitle>
                  <span className={`text-2xl font-bold tabular-nums ${members.length > 0 ? "text-primary" : "text-muted-foreground"}`}>
                    {loadingBdays ? <Skeleton className="h-7 w-6" /> : members.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loadingBdays ? (
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : members.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No birthdays {label.toLowerCase()}
                  </div>
                ) : (
                  <div className="divide-y max-h-56 overflow-y-auto">
                    {members.map((m) => (
                      <Link key={m.id} href={`/members/${m.id}`}>
                        <div className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors cursor-pointer">
                          <MemberAvatar member={m} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{m.firstName} {m.lastName}</p>
                            <p className="text-xs text-muted-foreground truncate">{m.zone} · {m.jamaat}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <WingBadge wing={m.wing} size="sm" />
                            <p className="text-xs text-muted-foreground mt-1">{m.age} yrs</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
