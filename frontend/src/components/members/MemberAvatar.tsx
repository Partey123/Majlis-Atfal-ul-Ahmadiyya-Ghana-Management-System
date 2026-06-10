import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MemberAvatarProps {
  member: {
    firstName: string;
    lastName: string;
    photoUrl?: string | null;
  };
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function MemberAvatar({ member, size = "md", className }: MemberAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-20 w-20 text-xl",
  };

  const initials = `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase();

  // Deterministic color based on name
  const colors = [
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",
    "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  ];
  
  const colorIndex = (member.firstName.charCodeAt(0) + member.lastName.charCodeAt(0)) % colors.length;
  const colorClass = colors[colorIndex];

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {member.photoUrl && <AvatarImage src={member.photoUrl} alt={`${member.firstName} ${member.lastName}`} />}
      <AvatarFallback className={cn("font-medium", colorClass)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
