import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: LucideIcon;
}

export function EmptyState({ title, description, action, icon: Icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border border-dashed rounded-lg bg-muted/10">
      {Icon && (
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
