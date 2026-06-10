import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteMember } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
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
import { useQueryClient } from "@tanstack/react-query";
import { getListMembersQueryKey } from "@workspace/api-client-react";

interface ArchiveBannerProps {
  memberId: number;
  memberName: string;
  onArchive?: () => void;
}

export function ArchiveBanner({ memberId, memberName, onArchive }: ArchiveBannerProps) {
  const [, setLocation] = useLocation();
  const deleteMember = useDeleteMember();
  const queryClient = useQueryClient();

  const handleArchive = () => {
    deleteMember.mutate({ id: memberId }, {
      onSuccess: () => {
        toast.success(`${memberName} has been archived successfully.`);
        queryClient.invalidateQueries({ queryKey: getListMembersQueryKey() });
        if (onArchive) {
          onArchive();
        } else {
          setLocation("/members");
        }
      },
      onError: () => {
        toast.error("Failed to archive member. Please try again.");
      }
    });
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-amber-900 dark:text-amber-400">Ready for Khuddam</h4>
          <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
            This member has graduated to Khuddam. Archive them to transfer out of the Atfal wing.
          </p>
        </div>
      </div>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="flex-shrink-0 bg-white dark:bg-black hover:bg-amber-100 hover:text-amber-900 dark:hover:bg-amber-900 dark:hover:text-amber-100 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400">
            Archive Member
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {memberName} from the Atfal system so they can be registered in the Khuddam wing. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} className="bg-amber-600 hover:bg-amber-700 text-white">
              Yes, archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
