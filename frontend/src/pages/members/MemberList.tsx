import { useState } from "react";
import { Link } from "wouter";
import { useListMembers } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, LayoutGrid, List as ListIcon, UserIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppContext } from "@/context/AppContext";
import { useDebounce } from "@/hooks/useDebounce";
import { MemberCard } from "@/components/members/MemberCard";
import { MemberFilters } from "@/components/filters/MemberFilters";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { motion, AnimatePresence } from "framer-motion";
import { MemberAvatar } from "@/components/members/MemberAvatar";
import { WingBadge } from "@/components/members/WingBadge";

export default function MemberList() {
  const { viewMode, setViewMode } = useAppContext();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  
  const [filters, setFilters] = useState({});

  const pageSize = viewMode === "card" ? 12 : 20;

  const { data, isLoading } = useListMembers(
    { 
      search: debouncedSearch || undefined, 
      page, 
      pageSize,
      ...filters 
    },
    { query: { keepPreviousData: true } as any }
  );

  const totalPages = data?.total ? Math.ceil(data.total / pageSize) : 1;

  const handleResetFilters = () => {
    setFilters({});
    setSearch("");
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== "") || search.length > 0;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Member Directory"
        subtitle="Manage and view all registered members"
        action={
          <Link href="/members/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Member
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members by name..."
              className="pl-9 w-full"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as any)} className="bg-muted p-1 rounded-md">
              <ToggleGroupItem value="card" aria-label="Card View" className="h-8 px-2.5">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List View" className="h-8 px-2.5">
                <ListIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <MemberFilters 
          filters={filters} 
          setFilters={(newFilters) => {
            setFilters(newFilters);
            setPage(1);
          }} 
          onReset={handleResetFilters} 
        />
      </div>

      <div className="min-h-[400px]">
        {isLoading && !data ? (
          viewMode === "card" ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="border rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <div className="space-y-2 mt-4 pt-4 border-t">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border rounded-md bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Wing</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        ) : data?.members?.length === 0 ? (
          <EmptyState
            title={hasActiveFilters ? "No matches found" : "No members yet"}
            description={hasActiveFilters 
              ? "Try adjusting your filters or search term to find what you're looking for." 
              : "Get started by adding the first member to the system."}
            icon={UserIcon}
            action={
              hasActiveFilters 
                ? <Button variant="outline" onClick={handleResetFilters}>Clear Filters</Button>
                : <Link href="/members/new"><Button>Add First Member</Button></Link>
            }
          />
        ) : (
          <>
            {viewMode === "card" ? (
              <motion.div 
                className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } }
                }}
              >
                {data?.members.map(member => (
                  <MemberCard key={member.id} member={member as any} />
                ))}
              </motion.div>
            ) : (
              <div className="border rounded-md bg-card overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Wing</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Guardian</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {data?.members.map(member => (
                        <TableRow key={member.id} className="hover:bg-muted/30 group">
                          <TableCell className="font-medium">
                            <Link href={`/members/${member.id}`} className="flex items-center gap-3 w-full group-hover:text-primary transition-colors">
                              <MemberAvatar member={member as any} size="sm" />
                              <div className="flex flex-col">
                                <span>{member.firstName} {member.lastName}</span>
                                {member.wing === "khuddam" && (
                                  <span className="text-[10px] text-amber-600 dark:text-amber-500 font-medium">Needs Archival</span>
                                )}
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell><WingBadge wing={member.wing} /></TableCell>
                          <TableCell>{member.age}</TableCell>
                          <TableCell>
                            <div className="flex flex-col text-sm">
                              <span>{member.zone}</span>
                              <span className="text-muted-foreground text-xs">{member.jamaat}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {member.guardianName || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Pagination */}
            {data && data.total > 0 && (
              <div className="mt-8 flex items-center justify-between border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(page * pageSize, data.total)}</span> of <span className="font-medium">{data.total}</span> members
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
