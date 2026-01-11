"use client";

import { FileText, FileCheck, DollarSign, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";

type StatsWidgetProps = {
  cvsOptimized: number;
  cvsGenerated: number;
  totalSpent: number;
  creditsUsed: number;
  isLoading?: boolean;
};

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  isLoading?: boolean;
};

function StatCard({ title, value, description, icon, isLoading }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-7 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-slate-500">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsWidget({
  cvsOptimized,
  cvsGenerated,
  totalSpent,
  creditsUsed,
  isLoading,
}: StatsWidgetProps) {
  const stats = [
    {
      title: "CVs Optimized",
      value: cvsOptimized,
      description: "Reference CVs improved",
      icon: <FileCheck className="h-4 w-4 text-slate-500" />,
    },
    {
      title: "CVs Generated",
      value: cvsGenerated,
      description: "Tailored for job descriptions",
      icon: <FileText className="h-4 w-4 text-slate-500" />,
    },
    {
      title: "Credits Used",
      value: creditsUsed.toLocaleString(),
      description: "Total consumption",
      icon: <TrendingUp className="h-4 w-4 text-slate-500" />,
    },
    {
      title: "Total Spent",
      value: `$${totalSpent.toFixed(2)}`,
      description: "All-time purchases",
      icon: <DollarSign className="h-4 w-4 text-slate-500" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} isLoading={isLoading} />
      ))}
    </div>
  );
}

export function StatsWidgetSkeleton() {
  return (
    <StatsWidget
      cvsOptimized={0}
      cvsGenerated={0}
      totalSpent={0}
      creditsUsed={0}
      isLoading
    />
  );
}
