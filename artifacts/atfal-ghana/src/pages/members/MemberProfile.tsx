import { useParams, useLocation } from "wouter";
import { useGetMember, useGetMemberHistory, useDeleteMember, getListMembersQueryKey } from "@workspace/api-client-react";
import { MemberAvatar } from "@/components/members/MemberAvatar";
import { WingBadge } from "@/components/members/WingBadge";
import { ArchiveBanner } from "@/components/members/ArchiveBanner";
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
  const params = useParams<{id: string}>();
  const id = Number(params.id);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: member, isLoading, error } = useGetMember(id, { query: { enabled: !!id } as any });
  const { data: history } = useGetMemberHistory(id, { query: { enabled: !!id } as any });
  const deleteMember = useDeleteMember();

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-destructive mb-2">Member Not Found</h2>
        <p className="text-muted-foreground mb-6">The member you are looking for does not exist or has been removed.</p>
        <Link href="/members"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory</Button></Link>
      </div>
    );
  }

  if (isLoading || !member) {
    return (
      <div className="space-y-8 pb-10">
        <Skeleton className="h-4 w-24" />
        <div className="flex items-start gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
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

  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto">
      <Link href="/members" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2">
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Members
      </Link>

      {member.wing === "khuddam" && (
        <ArchiveBanner memberId={member.id} memberName={`${member.firstName} ${member.lastName}`} />
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <MemberAvatar member={member} size="xl" className="border-4 border-background shadow-md shadow-black/5" />
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {member.firstName} {member.middleName ? `${member.middleName} ` : ""}{member.lastName}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
              <WingBadge wing={member.wing} size="md" />
              <span>&middot;</span>
              <span className="font-medium text-foreground">{member.age} years old</span>
              <span>&middot;</span>
              <span>Born {new Date(member.dateOfBirth).toLocaleDateString()}</span>
            </div>
            <div className="text-sm pt-1 text-muted-foreground">
              {member.sector} &rsaquo; {member.region} &rsaquo; {member.zone} &rsaquo; {member.circuit} &rsaquo; <span className="font-medium text-foreground">{member.jamaat}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => toast.info("Edit mode coming soon!")}>
            <Edit className="h-4 w-4" /> Edit
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" className="shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Member Profile</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove <strong>{member.firstName} {member.lastName}</strong> from the system. This cannot be undone.
                  If the member has graduated, consider using Archive instead.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                  Delete Permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full mt-8">
        <TabsList className="mb-6 w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
          <TabsTrigger 
            value="overview" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 font-medium"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 font-medium"
          >
            History & Audit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Card>
              <CardHeader className="pb-3 border-b bg-muted/20">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-primary" /> Member Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-[1fr_2fr] gap-2 text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Hash className="h-3.5 w-3.5" /> ID</span>
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded w-fit">{member.id}</span>
                  
                  <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> Joined</span>
                  <span>{new Date(member.createdAt).toLocaleDateString()}</span>
                  
                  <span className="text-muted-foreground flex items-center gap-2 mt-2 pt-2 border-t"><Clock className="h-3.5 w-3.5" /> Updated</span>
                  <span className="mt-2 pt-2 border-t">{member.updatedAt ? new Date(member.updatedAt).toLocaleDateString() : "—"}</span>
                </div>
                
                {member.position && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Office / Position</p>
                    <p className="font-medium text-primary">{member.position}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-3 border-b bg-muted/20">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Location Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col divide-y">
                  <div className="p-4 flex items-center justify-between hover:bg-muted/10">
                    <span className="text-sm text-muted-foreground">National Sector</span>
                    <span className="font-medium">{member.sector}</span>
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-muted/10">
                    <span className="text-sm text-muted-foreground">Region</span>
                    <span className="font-medium">{member.region}</span>
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-muted/10">
                    <span className="text-sm text-muted-foreground">Zone</span>
                    <span className="font-medium">{member.zone}</span>
                  </div>
                  <div className="p-4 flex items-center justify-between bg-primary/5 border-primary/20">
                    <span className="text-sm font-medium text-primary">Circuit & Jama'at</span>
                    <div className="text-right">
                      <span className="font-bold text-primary block">{member.circuit} Circuit</span>
                      <span className="text-sm font-medium">{member.jamaat} Jama'at</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader className="pb-3 border-b bg-muted/20">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Guardian Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {!member.guardianName && !member.guardianPhone && !member.guardianEmail ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No guardian information provided.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Guardian Name & Relation</p>
                        <p className="font-medium text-lg">{member.guardianName || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{member.guardianType || "Relation unspecified"}</p>
                      </div>
                      
                      {member.guardianAddress && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2 flex items-center gap-1"><Home className="h-3 w-3" /> Address</p>
                          <p className="text-sm p-3 bg-muted/30 rounded-md border">{member.guardianAddress}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {member.guardianPhone && (
                        <div className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Phone className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Phone Number</p>
                            <a href={`tel:${member.guardianPhone}`} className="font-medium hover:text-primary hover:underline">{member.guardianPhone}</a>
                          </div>
                        </div>
                      )}
                      
                      {member.guardianEmail && (
                        <div className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Mail className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Email Address</p>
                            <a href={`mailto:${member.guardianEmail}`} className="font-medium hover:text-primary hover:underline break-all">{member.guardianEmail}</a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
          </div>
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {!history || history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No history records found.</div>
              ) : (
                <div className="relative border-l border-muted ml-3 space-y-8 pb-4">
                  {history.map((record, i) => {
                    const isCreated = record.eventType === "created";
                    const isWingChange = record.eventType === "wing_change";
                    
                    return (
                      <div key={record.id} className="relative pl-6">
                        <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-background shadow-sm
                          ${isCreated ? 'bg-emerald-500' : isWingChange ? 'bg-amber-500' : 'bg-blue-500'}
                        `} />
                        
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1">
                          <h4 className="font-medium text-sm capitalize">
                            {record.eventType.replace('_', ' ')}
                          </h4>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(record.createdAt).toLocaleString()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-foreground mb-2">{record.description}</p>
                        
                        {record.previousValue && record.newValue && (
                          <div className="flex items-center gap-3 text-xs bg-muted/30 p-2 rounded border inline-flex">
                            <span className="text-muted-foreground line-through decoration-destructive/50">{record.previousValue}</span>
                            <span>&rarr;</span>
                            <span className="font-medium text-primary">{record.newValue}</span>
                          </div>
                        )}
                      </div>
                    )
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
