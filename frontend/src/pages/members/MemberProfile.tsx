import { useParams, useLocation } from "wouter";
import { useGetMember, useGetMemberHistory, useDeleteMember, getListMembersQueryKey } from "@workspace/api-client-react";
import { MemberAvatar } from "@/components/members/MemberAvatar";
import { WingBadge } from "@/components/members/WingBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, Trash2, MapPin, Phone, Mail, Home, UserIcon, Calendar, Hash, Clock, Users } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MemberProfile() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: member, isLoading, error } = useGetMember(id, { query: { enabled: !!id } as any });
  const { data: history } = useGetMemberHistory(id, { query: { enabled: !!id } as any });
  const deleteMember = useDeleteMember();

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-destructive mb-2">Member Not Found</h2>
        <p className="text-muted-foreground mb-6">This member does not exist or has been removed.</p>
        <Link href="/members">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory</Button>
        </Link>
      </div>
    );
  }

  if (isLoading || !member) {
    return (
      <div className="space-y-6 pb-10 px-1">
        <Skeleton className="h-4 w-24" />
        <div className="flex items-start gap-3">
          <Skeleton className="h-16 w-16 rounded-full shrink-0" />
          <div className="space-y-2 flex-1 min-w-0">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
        <div className="grid gap-4">
          <Skeleton className="h-[160px]" />
          <Skeleton className="h-[160px]" />
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    deleteMember.mutate({ id }, {
      onSuccess: () => {
        toast.success("Member deleted successfully");
        queryClient.invalidateQueries({ queryKey: getListMembersQueryKey() });
        navigate("/members");
      },
      onError: () => {
        toast.error("Failed to delete member");
      }
    });
  };

  const dobFormatted = member.dateOfBirth
    ? new Date(member.dateOfBirth).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

  return (
    <div className="space-y-5 pb-20 md:pb-10 max-w-3xl mx-auto w-full">

      {/* Back link */}
      <Link href="/members" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Members
      </Link>

      {/* Hero card */}
      <Card className="overflow-hidden">
        {/* Colour band */}
        <div className="h-2 w-full bg-gradient-to-r from-[hsl(142,52%,18%)] to-[hsl(43,80%,38%)]" />

        <CardContent className="p-4 sm:p-6">
          {/* Avatar + name row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
            <MemberAvatar member={member} size="xl" className="border-4 border-background shadow-md shrink-0 self-start sm:self-auto" />

            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground break-words leading-tight">
                  {member.firstName}{member.middleName ? ` ${member.middleName}` : ""} {member.lastName}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <WingBadge wing={member.wing} size="md" />
                  <span className="text-sm font-medium text-foreground">{member.age} years old</span>
                </div>
              </div>

              {/* Breadcrumb location */}
              <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                {[member.sector, member.region, member.zone, member.circuit].map((part, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <span className="opacity-40">›</span>}
                    <span className="truncate max-w-[90px] sm:max-w-none">{part}</span>
                  </span>
                ))}
                <span className="flex items-center gap-1">
                  <span className="opacity-40">›</span>
                  <strong className="text-foreground truncate max-w-[90px] sm:max-w-none">{member.jamaat}</strong>
                </span>
              </div>
            </div>

            {/* Action buttons — stacked on mobile */}
            <div className="flex gap-2 shrink-0 sm:self-start">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs"
                onClick={() => toast.info("Edit mode coming soon!")}
              >
                <Edit className="h-3.5 w-3.5" /> Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon" className="h-8 w-8 shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="mx-4 max-w-sm w-full">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Member Profile</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove <strong>{member.firstName} {member.lastName}</strong>. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
                    <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                      Delete Permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 overflow-x-auto">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2.5 font-medium whitespace-nowrap text-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2.5 font-medium whitespace-nowrap text-sm"
          >
            History & Audit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">

          {/* Personal details */}
          <Card>
            <CardHeader className="pb-3 border-b bg-muted/20 px-4 py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-primary" /> Member Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <dl className="divide-y">
                <div className="flex items-center justify-between px-4 py-3 gap-3">
                  <dt className="text-sm text-muted-foreground flex items-center gap-2 shrink-0">
                    <Hash className="h-3.5 w-3.5" /> ID
                  </dt>
                  <dd className="font-mono bg-muted px-2 py-0.5 rounded text-sm text-right"># {member.id}</dd>
                </div>
                <div className="flex items-center justify-between px-4 py-3 gap-3">
                  <dt className="text-sm text-muted-foreground flex items-center gap-2 shrink-0">
                    <Calendar className="h-3.5 w-3.5" /> Date of Birth
                  </dt>
                  <dd className="text-sm font-medium text-right">{dobFormatted}</dd>
                </div>
                <div className="flex items-center justify-between px-4 py-3 gap-3">
                  <dt className="text-sm text-muted-foreground flex items-center gap-2 shrink-0">
                    <UserIcon className="h-3.5 w-3.5" /> Age
                  </dt>
                  <dd className="text-sm font-medium">{member.age} years</dd>
                </div>
                <div className="flex items-center justify-between px-4 py-3 gap-3">
                  <dt className="text-sm text-muted-foreground flex items-center gap-2 shrink-0">
                    <Clock className="h-3.5 w-3.5" /> Registered
                  </dt>
                  <dd className="text-sm text-right">{new Date(member.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader className="pb-3 border-b bg-muted/20 px-4 py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Location Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <dl className="divide-y">
                {[
                  { label: "Sector",   value: member.sector },
                  { label: "Region",   value: member.region },
                  { label: "Zone",     value: member.zone   },
                  { label: "Circuit",  value: member.circuit },
                  { label: "Jama'at",  value: member.jamaat, highlight: true },
                ].map(({ label, value, highlight }) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between px-4 py-3 gap-3 ${highlight ? "bg-primary/5" : ""}`}
                  >
                    <dt className={`text-sm shrink-0 ${highlight ? "font-medium text-primary" : "text-muted-foreground"}`}>{label}</dt>
                    <dd className={`text-sm font-medium text-right break-words min-w-0 ${highlight ? "text-primary font-bold" : "text-foreground"}`}>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          {/* Guardian */}
          <Card>
            <CardHeader className="pb-3 border-b bg-muted/20 px-4 py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {!member.guardianName && !member.guardianPhone && !member.guardianEmail ? (
                <p className="text-center py-4 text-sm text-muted-foreground">No guardian information provided.</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Name & Relation</p>
                    <p className="font-medium break-words">{member.guardianName || "Unknown"}</p>
                    {member.guardianType && (
                      <p className="text-sm text-muted-foreground">{member.guardianType}</p>
                    )}
                  </div>

                  {member.guardianAddress && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                        <Home className="h-3 w-3" /> Address
                      </p>
                      <p className="text-sm p-3 bg-muted/30 rounded-md border break-words leading-relaxed">{member.guardianAddress}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3">
                    {member.guardianPhone && (
                      <a href={`tel:${member.guardianPhone}`} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/20 transition-colors">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="font-medium text-sm break-all">{member.guardianPhone}</p>
                        </div>
                      </a>
                    )}
                    {member.guardianEmail && (
                      <a href={`mailto:${member.guardianEmail}`} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/20 transition-colors">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-medium text-sm break-all">{member.guardianEmail}</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="history" className="pt-4">
          <Card>
            <CardHeader className="px-4 py-4">
              <CardTitle className="text-sm">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {!history || history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No history records found.</div>
              ) : (
                <div className="relative border-l border-muted ml-3 space-y-6 pb-2">
                  {history.map((record) => {
                    const isCreated = record.eventType === "created";
                    const isWingChange = record.eventType === "wing_change";
                    return (
                      <div key={record.id} className="relative pl-6">
                        <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-background shadow-sm
                          ${isCreated ? "bg-emerald-500" : isWingChange ? "bg-amber-500" : "bg-blue-500"}`}
                        />
                        <div className="flex flex-col gap-0.5 mb-1">
                          <h4 className="font-medium text-sm capitalize">
                            {record.eventType.replace("_", " ")}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(record.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mb-2">{record.description}</p>
                        {record.previousValue && record.newValue && (
                          <div className="flex flex-wrap items-center gap-2 text-xs bg-muted/30 p-2 rounded border w-fit max-w-full">
                            <span className="text-muted-foreground line-through decoration-destructive/50 break-all">{record.previousValue}</span>
                            <span>→</span>
                            <span className="font-medium text-primary break-all">{record.newValue}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
