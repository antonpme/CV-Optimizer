import { createClientForServerComponent } from '@/lib/supabase';
import { CreditsWidget } from '@/components/dashboard';
import { getDashboardStats, getRecentActivity } from '@/lib/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Gift, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

const typeIcons: Record<string, typeof ArrowUpRight> = {
  purchase: ArrowUpRight,
  spend: ArrowDownLeft,
  refund: RefreshCw,
  bonus: Gift,
};

const typeLabels: Record<string, string> = {
  purchase: 'Purchase',
  spend: 'Usage',
  refund: 'Refund',
  bonus: 'Bonus',
};

export default async function BillingPage() {
  const supabase = await createClientForServerComponent();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  const [dashboardStats, allTransactions] = await Promise.all([
    getDashboardStats(supabase, session.user.id),
    getRecentActivity(supabase, session.user.id, 50), // Get more for full history
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
        <p className="text-sm text-slate-600">
          Manage your credits and view transaction history.
        </p>
      </div>

      {/* Credits Widget */}
      <div className="max-w-sm">
        <CreditsWidget balance={dashboardStats.creditsBalance} />
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-500" />
            Transaction History
          </CardTitle>
          <CardDescription>
            Your credit purchases and usage history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allTransactions.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No transactions yet. Purchase credits to get started.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {allTransactions.map((tx) => {
                const Icon = typeIcons[tx.type] || ArrowDownLeft;
                const isPositive = tx.deltaCredits > 0;

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full ${
                          isPositive ? 'bg-green-100' : 'bg-slate-100'
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            isPositive ? 'text-green-600' : 'text-slate-600'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {tx.note || typeLabels[tx.type] || tx.type}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(tx.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={isPositive ? 'success' : 'secondary'}
                        className="font-mono"
                      >
                        {isPositive ? '+' : ''}
                        {tx.deltaCredits}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
