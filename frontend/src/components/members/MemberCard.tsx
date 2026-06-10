import { Link } from "wouter";
import { motion } from "framer-motion";
import { WingBadge } from "./WingBadge";
import type { Member } from "@workspace/api-client-react";
import { MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberCardProps {
  member: Member;
}

const WING_ACCENT: Record<string, { gradient: string; glow: string; ring: string }> = {
  atfal_sughir: {
    gradient: "from-sky-500 via-sky-400 to-cyan-400",
    glow: "shadow-sky-200/50 dark:shadow-sky-900/40",
    ring: "ring-sky-200 dark:ring-sky-800",
  },
  atfal_kabir: {
    gradient: "from-emerald-500 via-emerald-400 to-teal-400",
    glow: "shadow-emerald-200/50 dark:shadow-emerald-900/40",
    ring: "ring-emerald-200 dark:ring-emerald-800",
  },
  khuddam: {
    gradient: "from-amber-500 via-amber-400 to-yellow-400",
    glow: "shadow-amber-200/50 dark:shadow-amber-900/40",
    ring: "ring-amber-200 dark:ring-amber-800",
  },
};

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export function MemberCard({ member }: MemberCardProps) {
  const accent = WING_ACCENT[member.wing] ?? WING_ACCENT.atfal_sughir;
  const initials = getInitials(member.firstName, member.lastName);
  const dob = member.dateOfBirth
    ? new Date(member.dateOfBirth).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Link href={`/members/${member.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="group cursor-pointer h-full"
      >
        <div className={cn(
          "relative rounded-2xl bg-card border overflow-hidden h-full flex flex-col",
          "shadow-sm hover:shadow-xl transition-all duration-300",
          `hover:${accent.glow}`,
        )}>

          {/* ── Gradient banner ── */}
          <div className={cn("relative h-28 bg-gradient-to-br flex-shrink-0", accent.gradient)}>
            {/* Subtle texture overlay */}
            <div className="absolute inset-0 opacity-[0.15]"
              style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%), radial-gradient(circle at 20% 80%, white 0%, transparent 50%)" }} />

            {/* Wing badge top-right */}
            <div className="absolute top-3 right-3 z-10">
              <WingBadge wing={member.wing} />
            </div>

            {/* Member ID — top-left */}
            <div className="absolute top-3 left-3 z-10">
              <span className="text-[10px] font-mono font-semibold text-white/60 bg-black/20 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                #{member.id}
              </span>
            </div>
          </div>

          {/* ── Avatar — bridging banner and body ── */}
          <div className="px-5 -mt-9 z-10 relative">
            <div className={cn(
              "h-16 w-16 rounded-2xl border-[3px] border-card shadow-lg flex items-center justify-center font-bold text-lg text-white overflow-hidden",
              `bg-gradient-to-br ${accent.gradient}`,
              `ring-2 ${accent.ring}`,
            )}>
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={member.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="drop-shadow-sm">{initials}</span>
              )}
            </div>
          </div>

          {/* ── Content body ── */}
          <div className="px-5 pb-5 pt-2 flex flex-col flex-1">
            {/* Name */}
            <div className="mb-4">
              <h3 className="font-bold text-base leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {member.firstName}{member.middleName ? ` ${member.middleName}` : ""} {member.lastName}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                {member.age} years old
              </p>
            </div>

            {/* Detail rows */}
            <div className="space-y-2 mt-auto">
              {dob && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <Calendar className="h-3.5 w-3.5" />
                  </div>
                  <span>DOB: {dob}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span className="line-clamp-1 min-w-0">{member.zone} &middot; {member.jamaat}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 truncate">
                {member.sector}
              </span>
              {member.guardianName && (
                <span className="text-[10px] text-muted-foreground/50 truncate text-right max-w-[45%]">
                  {member.guardianName}
                </span>
              )}
            </div>
          </div>

          {/* Hover accent line at bottom */}
          <div className={cn(
            "absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            accent.gradient,
          )} />
        </div>
      </motion.div>
    </Link>
  );
}
