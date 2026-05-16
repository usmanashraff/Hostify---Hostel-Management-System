'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, Badge, Card, Button, Field, Input, Select, Textarea, Drawer, PageHeader, useToast } from '@/components/ui';
import { IconPlus, IconSearch, IconLogIn, IconCheck } from '@/components/icons';
import { getVisitors, createVisitor, exitVisitor, getStudents } from '@/lib/api';
import { formatDateTime, avatarHue } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import type { ApiVisitor, ApiStudent } from '@/types';

// ── LogVisitorDrawer ──────────────────────────────────────────────────────────
interface LogVisitorDrawerProps {
  open:     boolean;
  onClose:  () => void;
  students: ApiStudent[];
  staffId:  string;
  onSaved:  () => void;
}
const LogVisitorDrawer = ({ open, onClose, students, staffId, onSaved }: LogVisitorDrawerProps) => {
  const [form, setForm] = useState({
    visitorName: '', visitorPhone: '', cnic: '', purpose: '', studentId: '', remarks: '',
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (open) setForm({ visitorName: '', visitorPhone: '', cnic: '', purpose: '', studentId: '', remarks: '' });
  }, [open]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.visitorName || !form.purpose) { toast?.('Visitor name and purpose are required', 'error'); return; }
    setSaving(true);
    try {
      await createVisitor({
        visitorName:  form.visitorName,
        visitorPhone: form.visitorPhone || undefined,
        cnic:         form.cnic || undefined,
        purpose:      form.purpose,
        studentId:    form.studentId || undefined,
        remarks:      form.remarks || undefined,
        loggedById:   staffId,
      });
      toast?.('Visitor entry logged');
      onSaved();
      onClose();
    } catch (err: any) {
      toast?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Log New Visitor"
      subtitle="Record gate entry for a visitor"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Logging…' : 'Log Entry'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Visitor Name" required className="col-span-2">
            <Input value={form.visitorName} onChange={set('visitorName')} placeholder="Full name of visitor" />
          </Field>
          <Field label="Phone">
            <Input value={form.visitorPhone} onChange={set('visitorPhone')} placeholder="+92 300 0000000" />
          </Field>
          <Field label="CNIC">
            <Input value={form.cnic} onChange={set('cnic')} placeholder="00000-0000000-0" />
          </Field>
          <Field label="Purpose" required className="col-span-2">
            <Input value={form.purpose} onChange={set('purpose')} placeholder="e.g. Family visit, Fee payment" />
          </Field>
          <Field label="Visiting Student" className="col-span-2">
            <Select value={form.studentId} onChange={set('studentId')}>
              <option value="">Not visiting any student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.fullName} (Room {s.room?.roomNumber ?? '—'})</option>
              ))}
            </Select>
          </Field>
          <Field label="Remarks" className="col-span-2">
            <Textarea placeholder="Optional notes" value={form.remarks} onChange={set('remarks')} rows={3} />
          </Field>
        </div>
      </div>
    </Drawer>
  );
};

// ── VisitorRow ────────────────────────────────────────────────────────────────
interface VisitorRowProps { visitor: ApiVisitor; onExit: (v: ApiVisitor) => void; }
const VisitorRow = ({ visitor, onExit }: VisitorRowProps) => {
  const inside = visitor.status === 'inside';
  return (
    <tr className="hover:bg-slate-50/60 transition">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
            style={{ background: `hsl(${avatarHue(visitor.id)},55%,55%)` }}>
            {visitor.visitorName[0]}
          </div>
          <div>
            <div className="font-medium text-slate-900">{visitor.visitorName}</div>
            <div className="text-xs text-slate-500">{visitor.visitorPhone ?? '—'}</div>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-slate-600">{visitor.purpose}</td>
      <td className="px-3 py-3 text-slate-600">
        {visitor.studentName ? (
          <div>
            <div className="font-medium text-slate-800">{visitor.studentName}</div>
            <div className="text-xs text-slate-500">Room {visitor.roomNumber ?? '—'}</div>
          </div>
        ) : '—'}
      </td>
      <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{formatDateTime(visitor.entryTime)}</td>
      <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{visitor.exitTime ? formatDateTime(visitor.exitTime) : '—'}</td>
      <td className="px-3 py-3">
        <Badge tone={inside ? 'green' : 'gray'} dot>{inside ? 'Inside' : 'Exited'}</Badge>
      </td>
      <td className="px-5 py-3 text-right">
        {inside && (
          <Button size="sm" variant="secondary" icon={IconCheck} onClick={() => onExit(visitor)}>
            Mark Exited
          </Button>
        )}
      </td>
    </tr>
  );
};

// ── VisitorsPage ──────────────────────────────────────────────────────────────
interface VisitorsPageProps { onCountChange?: () => void; }
export const VisitorsPage = ({ onCountChange }: VisitorsPageProps) => {
  const [visitors,   setVisitors]   = useState<ApiVisitor[]>([]);
  const [students,   setStudents]   = useState<ApiStudent[]>([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [statusFilt, setStatusFilt] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: session } = useSession();
  const toast = useToast();

  const staffId = (session?.user as any)?.id ?? '';

  const load = () => {
    setLoading(true);
    const params: Record<string, string> = { limit: '100' };
    if (search)     params.search = search;
    if (statusFilt) params.status = statusFilt;
    getVisitors(params)
      .then((r) => { setVisitors(r.data); setTotal(r.total); })
      .catch((err) => toast?.(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getStudents({ status: 'active', limit: '100' }).then((r) => setStudents(r.data)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [search, statusFilt]);

  const handleExit = async (v: ApiVisitor) => {
    try {
      await exitVisitor(v.id);
      toast?.(`${v.visitorName} marked as exited`);
      load();
      onCountChange?.();
    } catch (err: any) {
      toast?.(err.message, 'error');
    }
  };

  const insideCount = visitors.filter((v) => v.status === 'inside').length;

  return (
    <div>
      <PageHeader
        title="Visitors Log"
        subtitle={`${total} total entries · ${insideCount} currently inside`}
        actions={<Button icon={IconPlus} onClick={() => setDrawerOpen(true)}>Log Visitor</Button>}
      />

      <Card className="p-3 mb-4">
        <div className="flex flex-col md:flex-row gap-2.5">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, CNIC or phone…"
              className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>
          <Select value={statusFilt} onChange={(e) => setStatusFilt(e.target.value)} className="w-40">
            <option value="">All Status</option>
            <option value="inside">Currently Inside</option>
            <option value="exited">Exited</option>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto nice-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Visitor</th>
                <th className="px-3 py-3">Purpose</th>
                <th className="px-3 py-3">Visiting</th>
                <th className="px-3 py-3">Entry Time</th>
                <th className="px-3 py-3">Exit Time</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-5 py-3"><div className="h-9 rounded-lg bg-slate-100 animate-pulse" /></td></tr>
                ))
              ) : visitors.map((v) => (
                <VisitorRow key={v.id} visitor={v} onExit={handleExit} />
              ))}
              {!loading && visitors.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500 text-sm">No visitor records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
          Showing {visitors.length} of {total} entries
        </div>
      </Card>

      <LogVisitorDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        students={students}
        staffId={staffId}
        onSaved={() => { load(); onCountChange?.(); }}
      />
    </div>
  );
};
