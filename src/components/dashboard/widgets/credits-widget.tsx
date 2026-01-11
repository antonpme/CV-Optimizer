"use client";

import { Coins, Plus } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Skeleton,
} from "@/components/ui";

type CreditsWidgetProps = {
  balance: number;
  isLoading?: boolean;
};

export function CreditsWidget({ balance, isLoading }: CreditsWidgetProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credits Balance</CardTitle>
          <Coins className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  const formattedBalance = balance.toLocaleString();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Credits Balance</CardTitle>
        <Coins className="h-4 w-4 text-slate-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedBalance}</div>
        <p className="text-xs text-slate-500 mb-3">
          {balance === 0 ? "No credits remaining" : "Available for CV optimization"}
        </p>
        <Button asChild size="sm" className="w-full">
          <Link href="/app/pricing">
            <Plus className="mr-2 h-4 w-4" />
            Top up credits
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function CreditsWidgetSkeleton() {
  return <CreditsWidget balance={0} isLoading />;
}
