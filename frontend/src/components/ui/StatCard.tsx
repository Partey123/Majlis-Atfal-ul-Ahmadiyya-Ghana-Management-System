import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface StatCardProps {
  title: string;
  value?: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  isLoading?: boolean;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, isLoading, className }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState<number | string | undefined>(0);

  useEffect(() => {
    if (typeof value === "number") {
      // Simple count up animation could go here, but for now just set it
      setDisplayValue(value);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">{typeof displayValue === "number" ? displayValue.toLocaleString() : displayValue}</div>
          )}
          {trend && !isLoading && (
            <p className={`text-xs mt-1 ${trend.isPositive ? "text-emerald-500" : "text-destructive"}`}>
              {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}% <span className="text-muted-foreground">{trend.label}</span>
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
