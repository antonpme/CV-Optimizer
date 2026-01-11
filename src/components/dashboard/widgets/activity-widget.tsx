"use client";

import { Clock, ArrowUpRight, ArrowDownRight, Gift, RefreshCw, Settings } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
} from "@/components/ui";

type TransactionType = "spend" | "topup" | "refund" | "grant" | "adjust";

type ActivityItem = {
  id: string;
  deltaCredits: number;
  type: TransactionType;
  note: string | null;
  createdAt: string;
};

type ActivityWidgetProps = {
  activities: ActivityItem[];
  isLoading?: boolean;
};

const typeIcons: Record<TransactionType, React.ReactNode> = {
  spend: <ArrowDownRight className="h-4 w-4 text-red-500" />,
  topup: <ArrowUpRight className="h-4 w-4 text-green-500" />,
  refund: <RefreshCw className="h-4 w-4 text-blue-500" />,
  grant: <Gift className="h-4 w-4 text-purple-500" />,
  adjust: <Settings className="h-4 w-4 text-slate-500" />,
};

const typeLabels: Record<TransactionType, string> = {
  spend: "Used",
  topup: "Purchased",
  refund: "Refunded",
  grant: "Bonus",
  adjust: "Adjustment",
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function ActivityItemRow({ item }: { item: ActivityItem }) {
  const isPositive = item.deltaCredits > 0;
  const credits = Math.abs(item.deltaCredits);

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
        {typeIcons[item.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {item.note || typeLabels[item.type]}
        </p>
        <p className="text-xs text-slate-500">
          {formatRelativeTime(item.createdAt)}
        </p>
      </div>
      <Badge variant={isPositive ? "success" : "secondary"}>
        {isPositive ? "+" : "-"}{credits}
      </Badge>
    </div>
  );
}

function ActivityItemSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-5 w-12 rounded-full" />
    </div>
  );
}

export function ActivityWidget({ activities, isLoading }: ActivityWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your latest credit transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <ActivityItemSkeleton key={i} />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            No activity yet. Start by optimizing a CV!
          </p>
        ) : (
          <div className="space-y-1">
            {activities.map((item) => (
              <ActivityItemRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ActivityWidgetSkeleton() {
  return <ActivityWidget activities={[]} isLoading />;
}
