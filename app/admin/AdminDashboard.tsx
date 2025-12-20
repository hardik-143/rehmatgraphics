'use client';

import { useState, useEffect, useCallback } from 'react';
// Users list removed; no Link usage
import { Users, Clock, Activity, Package } from 'lucide-react';
// EmptyState and table-related icons removed
import AdminLayout from '@/app/admin/components/AdminLayout';

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
}

interface ActivityStats {
  totalActivities: number;
  todayActivities: number;
  rangeActivities?: number;
  activityBreakdown: Array<{ action: string; count: number }>;
}

// Removed ActivityType usage

// Pagination and ActivityLog interfaces removed as logs table is not shown

// Removed AdminUserAddress usage

// Removed AdminUserRow usage

interface CurrentAdmin {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AdminDashboardProps {
  stats: AdminStats;
  currentAdmin: CurrentAdmin;
}

// Removed tabs

const AdminDashboard = ({ stats, currentAdmin }: AdminDashboardProps) => {
  const [metrics] = useState(stats);
  // Removed user approval flows and feedback
  // Removed users table in favor of metrics + activity logs
  // Users table removed

  // Activity log state
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(
    null
  );
  const [activityRange, setActivityRange] = useState<string>('today');
  // Logs-related states removed

  const fetchActivityStats = useCallback(async (range?: string) => {
    try {
      const params = new URLSearchParams();
      if (range) params.set('range', range);
      const response = await fetch(`/api/admin/activity-logs?${params}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch activity stats');
      }
      setActivityStats(data.stats);
    } catch (error) {
      console.error('fetchActivityStats error:', error);
    }
  }, []);

  useEffect(() => {
    fetchActivityStats(activityRange);
  }, [fetchActivityStats, activityRange]);

  const handleActivityRangeChange = (range: string) => {
    setActivityRange(range);
  };

  // Page change handler removed

  // User approval UI removed

  return (
    <AdminLayout
      currentAdmin={{
        email: currentAdmin.email,
        firstName: currentAdmin.firstName,
      }}
      title="Admin Dashboard"
    >
      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 md:max-lg:grid-cols-1">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Total Users
            </p>
            <Users className="h-5 w-5 text-brand-primary" aria-hidden />
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {metrics.totalUsers}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Total Products
            </p>
            <Package className="h-5 w-5 text-emerald-600" aria-hidden />
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {metrics.totalProducts}
          </p>
        </div>
        {activityStats && (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Total Activities
                </p>
                <Activity className="h-5 w-5 text-brand-primary" aria-hidden />
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {activityStats.totalActivities}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Selected Range
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-500" aria-hidden />
                  <select
                    value={activityRange}
                    onChange={(e) => handleActivityRangeChange(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 focus:border-slate-400 focus:outline-none"
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {typeof activityStats.rangeActivities === 'number'
                  ? activityStats.rangeActivities
                  : activityStats.todayActivities}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Activity Logs removed from dashboard */}
    </AdminLayout>
  );
};

export default AdminDashboard;
