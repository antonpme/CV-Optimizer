import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Lock } from 'lucide-react';

export default function ApplicationsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-slate-900">Applications</h1>
          <Badge variant="secondary" className="text-xs">
            Coming Q2
          </Badge>
        </div>
        <p className="text-sm text-slate-600">
          Track your job applications and monitor responses.
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="border-dashed">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Lock className="h-8 w-8 text-slate-400" />
          </div>
          <CardTitle className="text-lg">Application Tracking Coming Soon</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            We&apos;re building a powerful application tracking system to help you manage your job search.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="grid gap-4 md:grid-cols-3 max-w-2xl mx-auto mt-4">
            <div className="p-4 rounded-lg bg-slate-50">
              <Send className="h-6 w-6 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Auto-Apply</p>
              <p className="text-xs text-slate-500">Fill forms automatically</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
              <div className="h-6 w-6 mx-auto mb-2 flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
              <p className="text-sm font-medium text-slate-700">Track Status</p>
              <p className="text-xs text-slate-500">Applied → Interview → Offer</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
              <div className="h-6 w-6 mx-auto mb-2 flex items-center justify-center">
                <span className="text-lg">📬</span>
              </div>
              <p className="text-sm font-medium text-slate-700">Response Alerts</p>
              <p className="text-xs text-slate-500">Get notified on updates</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
