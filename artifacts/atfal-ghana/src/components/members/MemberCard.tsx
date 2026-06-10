import { Link } from "wouter";
import { motion } from "framer-motion";
import { MemberAvatar } from "./MemberAvatar";
import { WingBadge } from "./WingBadge";
import type { Member } from "@workspace/api-client-react";
import { MapPin, UserIcon } from "lucide-react";

interface MemberCardProps {
  member: Member;
}

export function MemberCard({ member }: MemberCardProps) {
  return (
    <Link href={`/members/${member.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="block group"
      >
        <div className="relative rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md h-full flex flex-col">
          {member.wing === "khuddam" && (
            <div className="absolute top-0 inset-x-0 h-1 bg-amber-500 rounded-t-2xl" />
          )}
          
          <div className="flex items-start justify-between gap-4 mb-4">
            <MemberAvatar member={member} size="lg" />
            <WingBadge wing={member.wing} />
          </div>
          
          <div className="mb-4 flex-1">
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {member.firstName} {member.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">
              {member.age} yrs
            </p>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground mt-auto">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{member.zone} &middot; {member.jamaat}</span>
            </div>
            {member.guardianName && (
              <div className="flex items-center gap-2">
                <UserIcon className="h-3.5 w-3.5" />
                <span className="line-clamp-1">{member.guardianName}</span>
              </div>
            )}
          </div>
          
          {member.wing === "khuddam" && (
            <div className="mt-4 pt-3 border-t border-border/50 text-xs font-medium text-amber-600 dark:text-amber-500">
              Ready to Archive
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
