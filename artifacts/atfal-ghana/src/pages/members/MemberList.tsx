import { useState } from "react";
import { Link } from "wouter";
import { useListMembers } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MemberList() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useListMembers({ search, page: 1, pageSize: 20 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Member Directory</h1>
          <p className="text-muted-foreground mt-1">Manage and view all registered members.</p>
        </div>
        <Link href="/members/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Member
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Wing</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            ) : data?.members?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              data?.members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <Link href={`/members/${member.id}`} className="hover:underline text-primary">
                      {member.firstName} {member.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{member.wing.replace('_', ' ')}</span>
                  </TableCell>
                  <TableCell>{member.age}</TableCell>
                  <TableCell>{member.jamaat}, {member.circuit}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
