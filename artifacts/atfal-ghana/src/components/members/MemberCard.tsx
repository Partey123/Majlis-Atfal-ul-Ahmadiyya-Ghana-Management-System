import { Link } from "wouter";
import { motion } from "framer-motion";
import { WingBadge } from "./WingBadge";
import type { Member } from "@workspace/api-client-react";
import { MapPin, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberCardProps {
  member: Member;
}

const WING_GRADIENT: Record<string, string> = {
  atfal_sughir: "from-sky-500 to-sky-600",
  atfal_kabir: "from-emerald-500 to-emerald-600",
  khuddam: "from-amber-500 to-amber-600",
};

const WING_BG: Record<string, string> = {
  atfal_sughir: "bg-sky-50 dark:bg-sky-950/30",
  atfal_kabir: "bg-emerald-50 dark:bg-emerald-950/30",
  khuddam: "bg-amber-50 dark:bg-amber-950/30",
};

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export function MemberCard({ member }: MemberCardProps) {
  const gradient = WING_GRADIENT[member.wing] ?? "from-slate-500 to-slate-600";
  const bg = WING_BG[member.wing] ?? "";
  const initials = getInitials(member.firstName, member.lastName);
  const dob = member.dateOfBirth
    ? new Date(member.dateOfBirth).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  return (
    <Link href={`/members/${member.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="block group cursor-pointer h-full"
      >
        <div className="relative rounded-2xl border bg-card shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden h-full flex flex-col">

          {/* ── Banner / Avatar area ── */}
          <div className={cn("relative h-24 bg-gradient-to-br", gradient, "flex items-end justify-center pb-0")}>
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_30%,white,transparent)]" />
            <div className={cn(
              "w-16 h-16 rounded-full border-4 border-card flex items-center justify-center font-bold text-xl text-white shadow-md absolute -bottom-8 left-5",
              `bg-gradient-to-br ${gradient}`
            )}>
              {member.photoUrl ? (
                <img src={member.photoUrl} alt={member.firstName} className="w-full h-full rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="absolute top-3 right-3">
              <WingBadge wing={member.wing} />
            </div>
          </div>

          {/* ── Content ── */}
          <div className="pt-10 px-5 pb-5 flex flex-col flex-1">
            <div className="mb-3">
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1">
                {member.firstName} {member.lastName}
              </h3>
              {member.middleName && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{member.middleName}</p>
              )}
            </div>

            <div className="space-y-2 text-xs text-muted-foreground mt-auto">
              {dob && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>{dob} &middot; {member.age} yrs</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-1">{member.zone} · {member.jamaat}</span>
              </div>
              {member.guardianName && (
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-1">{member.guardianName}</span>
                </div>
              )}
            </div>

            {/* Footer chip */}
            <div className={cn("mt-4 pt-3 border-t border-border/50 flex items-center justify-between")}>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {member.sector}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground/40">#{member.id}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
