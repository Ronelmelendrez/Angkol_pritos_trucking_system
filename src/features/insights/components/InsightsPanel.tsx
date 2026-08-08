import { Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { InsightCard } from "./InsightCard";
import type { Insight } from "../types";

interface InsightsPanelProps {
  insights: Insight[];
  isLoading?: boolean;
  limit?: number;
  title?: string;
  description?: string;
}

export function InsightsPanel({
  insights,
  isLoading,
  limit,
  title = "Key insights",
  description = "What the numbers are telling you",
}: InsightsPanelProps) {
  const visible = limit ? insights.slice(0, limit) : insights;

  return (
    <Card className="ticket">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent-dark" />
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-faint">
          Not enough data yet — insights will appear as you log sales, expenses, and attendance.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </Card>
  );
}
