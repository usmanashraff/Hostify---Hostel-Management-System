'use client';

import React, { useState, useEffect } from 'react';
import { Badge, Card, Button, PageHeader } from '@/components/ui';
import {
  IconUsers, IconBed, IconHome, IconWallet, IconWrench,
  IconBell, IconPlus, IconChevronRight, type IconProps,
} from '@/components/icons';
import { getDashboard } from '@/lib/api';
import { formatPKR } from '@/lib/utils';
import type { DashboardStats, ActivityLog } from '@/types';
import type { RouteId } from '@/components/sidebar';

// ── StatCard ──────────────────────────────────────────────────────────────────
type StatTone = 'blue' | 'green' | 'slate' | 'orange' | 'rose';
interface StatCardProps {
  label: string; value: string | number; sub?: string;
  icon: React.ComponentType<IconProps>; tone?: StatTone;
}
const StatCard = ({ label, value, sub, icon: Icon, tone = 'blue' }: StatCardProps) => {
  const tones: Record<StatTone, { bg: string; fg: string }> = {
    blue:   { bg: 'bg-brand-50',   fg: 'text-brand-600' },
    green:  { bg: 'bg-emerald-50', fg: 'text-emerald-600' },
    slate:  { bg: 'bg-slate-100',  fg: 'text-slate-600' },
    orange: { bg: 'bg-amber-50',   fg: 'text-amber-600' },
    rose:   { bg: 'bg-rose-50',    fg: 'text-rose-600' },
  };
  const { bg, fg } = tones[tone];
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[13px] font-medium text-slate-500">{label}</div>
          <div className="mt-1.5 text-[28px] font-semibold text-slate-900 leading-none tracking-tight">{value}</div>
          {sub && <div className="mt-2 text-xs text-slate-500">{sub}</div>}
        </div>
        <div className={`h-10 w-10 rounded-lg ${bg} ${fg} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
};

// ── QuickAction ───────────────────────────────────────────────────────────────
type QATone = 'blue' | 'green' | 'orange';
interface QuickActionProps {
  icon: React.ComponentType<IconProps>; label: string; sub: string;
  onClick: () => void; tone?: QATone;
}
const QuickAction = ({ icon: Icon, label, sub, onClick, tone = 'blue' }: QuickActionProps) => {
  const tones: Record<QATone, string> = {
    blue:   'bg-brand-50 text-brand-700 hover:bg-brand-100',
    green:  'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    orange: 'bg-amber-50 text-amber-800 hover:bg-amber-100',
  };
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-brand-300 hover:shadow-card transition text-left flex-1 min-w-[180px]"
    >
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-slate-900">{label}</div>
        <div className="text-xs text-slate-500">{sub}</div>
      </div>
      <IconChevronRight size={16} className="text-slate-300 group-hover:text-brand-500 transition" />
    </button>
  );
};

// ── Activity icon by type ─────────────────────────────────────────────────────
function activityDot(type: string) {
  const map: Record<string, string> = {
    student:   'bg-brand-500',
    complaint: 'bg-rose-500',
    visitor:   'bg-amber-500',
    notice:    'bg-violet-500',
  };
  return map[type] ?? 'bg-slate-400';
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── DashboardPage ─────────────────────────────────────────────────────────────
interface DashboardPageProps {
  onNav: (id: RouteId) => void;
  onAddStudent: () => void;
  onRecordPayment: () => void;
  onAddComplaint: () => void;
}
export const DashboardPage = ({ onNav, onAddStudent, onRecordPayment, onAddComplaint }: DashboardPageProps) => {
  const [stats,    setStats]    = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getDashboard().then((res) => {
      if (res.data) {
        setStats(res.data.stats);
        setActivity(res.data.activityFeed);
      }
    }).finally(() => setLoading(false));
  }, []);

  const todayStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const occupancy = stats && stats.totalCapacity > 0
    ? Math.round((stats.occupiedBeds / stats.totalCapacity) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, Admin`}
        subtitle={todayStr}
        actions={
          <Button variant="primary" icon={IconPlus} onClick={onAddStudent}>Add Student</Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Students"  value={loading ? '—' : stats?.totalStudents ?? 0}  sub={`${occupancy}% hostel occupancy`} icon={IconUsers} tone="blue" />
        <StatCard label="Occupied Beds"   value={loading ? '—' : stats?.occupiedBeds  ?? 0}  sub="beds currently in use"             icon={IconBed}   tone="green" />
        <StatCard label="Vacant Beds"     value={loading ? '—' : stats?.vacantBeds    ?? 0}  sub="beds available"                    icon={IconHome}  tone="slate" />
        <StatCard label="Pending Fees"    value={loading ? '—' : stats?.pendingFees   ?? 0}  sub={stats ? formatPKR((stats.pendingFees) * 12000) + ' outstanding' : ''} icon={IconWallet} tone="orange" />
        <StatCard label="Open Complaints" value={loading ? '—' : stats?.openComplaints ?? 0} sub={stats ? `${stats.visitorsInside} visitor(s) inside` : ''} icon={IconWrench} tone="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Quick Actions</h2>
            <p className="text-xs text-slate-500 mt-0.5">Common tasks for hostel admin</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <QuickAction icon={IconPlus}   label="Add Student"    sub="Enroll new resident"    onClick={onAddStudent}    tone="blue" />
            <QuickAction icon={IconWallet} label="Record Payment" sub="Log monthly fee"        onClick={onRecordPayment} tone="green" />
            <QuickAction icon={IconWrench} label="Add Complaint"  sub="File maintenance issue" onClick={onAddComplaint}  tone="orange" />
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Overview</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Notices active', value: stats?.activeNotices ?? 0, color: 'text-violet-600', tone: 'bg-violet-50', onClick: () => onNav('notices') },
                { label: 'Visitors inside', value: stats?.visitorsInside ?? 0, color: 'text-amber-600', tone: 'bg-amber-50', onClick: () => onNav('visitors') },
                { label: 'Total capacity', value: stats?.totalCapacity ?? 0, color: 'text-slate-900', tone: 'bg-slate-100', onClick: () => onNav('rooms') },
                { label: 'Fees pending', value: stats?.pendingFees ?? 0, color: 'text-rose-600', tone: 'bg-rose-50', onClick: () => onNav('fees') },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="rounded-lg border border-slate-200 p-3 text-left hover:border-brand-300 hover:bg-brand-50/30 transition"
                >
                  <div className={`text-xl font-semibold ${item.color}`}>{loading ? '—' : item.value}</div>
                  <div className="mt-1 text-[11px] text-slate-500">{item.label}</div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest events</p>
            </div>
            <Badge tone="blue" dot>Live</Badge>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No recent activity</p>
          ) : (
            <ul className="space-y-3.5">
              {activity.map((a, i) => (
                <li key={a.id} className="flex gap-3">
                  <div className="relative flex flex-col items-center pt-1">
                    <span className={`h-2 w-2 rounded-full ${activityDot(a.type)}`} />
                    {i < activity.length - 1 && <span className="flex-1 w-px bg-slate-200 mt-1" />}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="text-[13px] font-semibold text-slate-900">{a.action}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{a.description}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(a.timestamp).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};
