import { useState } from "react";
import { useGetUpcomingGraduations, useListGraduations } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { GraduationCap, CalendarDays, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MemberAvatar } from "@/components/members/MemberAvatar";
import { WingBadge } from "@/components/members/WingBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function Graduations() {
  const { data: upcoming, isLoading: isLoadingUpcoming } = useGetUpcomingGraduations();
  const [period, setPeriod] = useState<string>("all");
  const { data: records, isLoading: isLoadingRecords } = useListGraduations(
    { period: period === "all" ? undefined : period as any },
    { query: { enabled: true } as any }
  );

  return (
    <div className="space-y-8 pb-10">
      <PageHeader 
        title="Graduations" 
        subtitle="Manage member transitions between wings based on age."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Upcoming This Month"
          value={upcoming?.thisMonth?.length || 0}
          icon={CalendarDays}
          isLoading={isLoadingUpcoming}
          className="border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20"
        />
        <StatCard
          title="Upcoming This Year"
          value={upcoming?.thisYear?.length || 0}
          icon={GraduationCap}
          isLoading={isLoadingUpcoming}
        />
      </div>

      <Tabs defaultValue="upcoming" className="w-full space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming" className="gap-2"><CalendarDays className="h-4 w-4" /> Upcoming</TabsTrigger>
          <TabsTrigger value="records" className="gap-2"><History className="h-4 w-4" /> Records</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          <Tabs defaultValue="thisMonth">
            <TabsList className="mb-4">
              <TabsTrigger value="thisMonth">This Month</TabsTrigger>
              <TabsTrigger value="thisQuarter">This Quarter</TabsTrigger>
              <TabsTrigger value="thisYear">This Year</TabsTrigger>
            </TabsList>
            
            {["thisMonth", "thisQuarter", "thisYear"].map(tab => {
              const dataList = upcoming?.[tab as keyof typeof upcoming] || [];
              const isUrgent = tab === "thisMonth" && dataList.length > 0;
              
              return (
                <TabsContent key={tab} value={tab}>
                  {isLoadingUpcoming ? (
                    <div className="space-y-3">
                      {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                    </div>
                  ) : dataList.length === 0 ? (
                    <EmptyState 
                      title="No upcoming graduations"
                      description={`There are no members turning 15 ${tab === "thisMonth" ? "this month" : tab === "thisQuarter" ? "this quarter" : "this year"}.`}
                      icon={GraduationCap}
                    />
                  ) : (
                    <div className="grid gap-3">
                      {dataList.map(member => (
                        <Link key={member.id} href={`/members/${member.id}`}>
                          <div className={`p-4 rounded-lg border flex items-center justify-between gap-4 transition-colors hover:shadow-sm ${isUrgent ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50' : 'bg-card'}`}>
                            <div className="flex items-center gap-4">
                              <MemberAvatar member={member} />
                              <div>
                                <h4 className="font-medium">{member.firstName} {member.lastName}</h4>
                                <p className="text-sm text-muted-foreground">{member.zone} &middot; {member.jamaat}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className={isUrgent ? "text-amber-700 bg-amber-100 border-amber-300 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800" : ""}>
                                Turns 15 on {new Date(member.dateOfBirth).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                Currently <span className="capitalize">{member.wing.replace('_', ' ')}</span>
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <div className="flex justify-end">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="thisQuarter">This Quarter</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="border rounded-md bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Transition</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingRecords ? (
                  Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-40 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : records?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No graduation records found for this period.
                    </TableCell>
                  </TableRow>
                ) : records?.map(record => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      <Link href={`/members/${record.memberId}`} className="hover:text-primary hover:underline">
                        {record.memberName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{record.region} &middot; {record.zone}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <WingBadge wing={record.previousWing} />
                        <span className="text-muted-foreground text-xs">&rarr;</span>
                        <WingBadge wing={record.newWing} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(record.graduatedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
