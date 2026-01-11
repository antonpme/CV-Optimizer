import { createClientForServerComponent } from '@/lib/supabase';
import { CreditsWidget, StatsWidget, ActivityWidget } from '@/components/dashboard';
import { getDashboardStats, getRecentActivity } from '@/lib/dashboard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClientForServerComponent();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  const [dashboardStats, recentActivity] = await Promise.all([
    getDashboardStats(supabase, session.user.id),
    getRecentActivity(supabase, session.user.id, 5),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-600">
          Your CV optimization overview and credits balance.
        </p>
      </div>

      {/* Stats Grid */}
      <StatsWidget
        cvsOptimized={dashboardStats.cvsOptimized}
        cvsGenerated={dashboardStats.cvsGenerated}
        totalSpent={dashboardStats.totalSpentUsd}
        creditsUsed={dashboardStats.creditsUsed}
      />

      {/* Credits + Activity Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreditsWidget balance={dashboardStats.creditsBalance} />
        <div className="md:col-span-1 lg:col-span-2">
          <ActivityWidget activities={recentActivity} />
        </div>
      </div>
    </div>
  );
}
