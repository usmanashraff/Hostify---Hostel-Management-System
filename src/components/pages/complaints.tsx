'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, Badge, Card, Button, Field, Select, Textarea, Drawer, Modal, PageHeader, useToast } from '@/components/ui';
import { IconPlus, IconCalendar, IconBolt, IconDroplet, IconSparkle, IconWrench, type IconProps } from '@/components/icons';
import { getComplaints, getStudents, createComplaint, updateComplaint, deleteComplaint } from '@/lib/api';
import { avatarHue, formatDate } from '@/lib/utils';
import type { ApiComplaint, ApiStudent, ComplaintCategory, ComplaintStatus } from '@/types';

const CATEGORY_META: Record<ComplaintCategory, { icon: React.ComponentType<IconProps>; label: string; tone: 'orange' | 'blue' | 'green' | 'gray'; bg: string; fg: string }> = {
  electricity: { icon: IconBolt,    label: 'Electricity', tone: 'orange', bg: 'bg-amber-50',   fg: 'text-amber-700' },
  water:       { icon: IconDroplet, label: 'Water',       tone: 'blue',   bg: 'bg-brand-50',   fg: 'text-brand-700' },
  cleanliness: { icon: IconSparkle, label: 'Cleanliness', tone: 'green',  bg: 'bg-emerald-50', fg: 'text-emerald-700' },
  other:       { icon: IconWrench,  label: 'Other',       tone: 'gray',   bg: 'bg-slate-100',  fg: 'text-slate-700' },
};

const STATUS_META: Record<ComplaintStatus, { tone: 'red' | 'orange' | 'green'; label: string }> = {
  open:        { tone: 'red',    label: 'Open' },
  in_progress: { tone: 'orange', label: 'In Progress' },
  resolved:    { tone: 'green',  label: 'Resolved' },
};

// ── ComplaintCard ─────────────────────────────────────────────────────────────
interface ComplaintCardProps {
  complaint: ApiComplaint;
  onUpdate:  (c: ApiComplaint) => void;
  onDelete:  (c: ApiComplaint) => void;
}
const ComplaintCard = ({ complaint, onUpdate, onDelete }: ComplaintCardProps) => {
  const cat  = CATEGORY_META[complaint.category] ?? CATEGORY_META.other;
  const st   = STATUS_META[complaint.status];
  const Icon = cat.icon;

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 rounded-lg ${cat.bg} ${cat.fg} flex items-center justify-center shrink-0`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={cat.tone}>{cat.label}</Badge>
            <Badge tone={st.tone} dot>{st.label}</Badge>
          </div>
          {complaint.studentName && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{ background: `hsl(${avatarHue(complaint.studentId)},65%,55%)` }}>
                {complaint.studentName[0]}
              </div>
              <span className="text-sm font-semibold text-slate-900">{complaint.studentName}</span>
              <span className="text-slate-500 text-sm">· Room {complaint.roomNumber ?? '—'}</span>
            </div>
          )}
          <p className="mt-2.5 text-sm text-slate-700 leading-relaxed">{complaint.description}</p>

          {complaint.resolutionNote && (
            <div className="mt-3 p-2.5 rounded-md bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Resolution note</div>
              <div className="text-[13px] text-slate-700">{complaint.resolutionNote}</div>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <IconCalendar size={14} />
              <span>Filed {formatDate(complaint.createdAt)}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => onUpdate(complaint)}>Update Status</Button>
              {complaint.status === 'resolved' && (
                <Button size="sm" variant="ghost" onClick={() => onDelete(complaint)}>Delete</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ── AddComplaintDrawer ────────────────────────────────────────────────────────
interface AddComplaintDrawerProps {
  open:     boolean;
  onClose:  () => void;
  students: ApiStudent[];
  onSaved:  () => void;
}
const AddComplaintDrawer = ({ open, onClose, students, onSaved }: AddComplaintDrawerProps) => {
  const [form, setForm] = useState({ studentId: '', category: 'electricity' as ComplaintCategory, description: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (open) setForm({ studentId: students[0]?.id ?? '', category: 'electricity', description: '' });
  }, [open, students]);

  const student = students.find((s) => s.id === form.studentId);

  const handleSubmit = async () => {
    if (!form.studentId || !form.description) { toast?.('Please complete required fields', 'error'); return; }
    if (!student) return;
    setSaving(true);
    try {
      await createComplaint({
        studentId:   form.studentId,
        roomId:      student.roomId,
        category:    form.category,
        description: form.description,
      });
      toast?.('Complaint filed successfully');
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
      title="File New Complaint"
      subtitle="Log a maintenance or facility issue"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Submitting…' : 'Submit Complaint'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Student" required>
          <Select value={form.studentId} onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}>
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.fullName} (Room {s.room?.roomNumber ?? '—'})</option>
            ))}
          </Select>
        </Field>

        {student && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <Avatar name={student.fullName} hue={avatarHue(student.id)} size={36} />
            <div className="text-xs text-slate-600 flex-1">
              <div className="font-semibold text-slate-900 text-sm">{student.fullName}</div>
              <div>Room {student.room?.roomNumber ?? '—'} · {student.phone}</div>
            </div>
          </div>
        )}

        <Field label="Category" required>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(CATEGORY_META) as [ComplaintCategory, typeof CATEGORY_META[ComplaintCategory]][]).map(([id, m]) => {
              const Icon = m.icon;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: id }))}
                  className={`h-12 px-3 rounded-lg border text-sm font-medium flex items-center gap-2 transition ${
                    form.category === id ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={18} />{m.label}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Description" required>
          <Textarea rows={5} placeholder="Describe the issue in detail…" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </Field>
      </div>
    </Drawer>
  );
};

// ── UpdateStatusModal ─────────────────────────────────────────────────────────
interface UpdateStatusModalProps {
  open:     boolean;
  onClose:  () => void;
  complaint: ApiComplaint | null;
  onSaved:  () => void;
}
const UpdateStatusModal = ({ open, onClose, complaint, onSaved }: UpdateStatusModalProps) => {
  const [status, setStatus] = useState<ComplaintStatus>('open');
  const [note,   setNote]   = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (complaint) { setStatus(complaint.status); setNote(complaint.resolutionNote ?? ''); }
  }, [complaint]);

  if (!complaint) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateComplaint(complaint.id, { status, resolutionNote: note || undefined });
      toast?.('Complaint updated');
      onSaved();
      onClose();
    } catch (err: any) {
      toast?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Update Complaint"
      subtitle={complaint.category}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-sm text-slate-600">{complaint.description}</div>
        <Field label="Status" required>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(STATUS_META) as [ComplaintStatus, typeof STATUS_META[ComplaintStatus]][]).map(([id, m]) => (
              <button
                key={id}
                type="button"
                onClick={() => setStatus(id)}
                className={`h-10 rounded-lg border text-sm font-medium transition ${
                  status === id ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Resolution Note">
          <Textarea placeholder="Add an update or resolution note…" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
};

// ── ComplaintsPage ────────────────────────────────────────────────────────────
interface ComplaintsPageProps {
  openTrigger?:    number;
  onClearTrigger?: () => void;
  onCountChange?:  () => void;
}
export const ComplaintsPage = ({ openTrigger = 0, onClearTrigger, onCountChange }: ComplaintsPageProps) => {
  const [complaints, setComplaints] = useState<ApiComplaint[]>([]);
  const [students,   setStudents]   = useState<ApiStudent[]>([]);
  const [total,      setTotal]      = useState(0);
  const [filter,     setFilter]     = useState<'all' | ComplaintStatus>('all');
  const [loading,    setLoading]    = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing,    setEditing]    = useState<ApiComplaint | null>(null);
  const toast = useToast();

  const load = (f?: string) => {
    setLoading(true);
    const params: Record<string, string> = { limit: '100' };
    if (f && f !== 'all') params.status = f;
    getComplaints(params)
      .then((r) => { setComplaints(r.data); setTotal(r.total); })
      .catch((err) => toast?.(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getStudents({ status: 'active', limit: '100' }).then((r) => setStudents(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (openTrigger > 0) {
      setDrawerOpen(true);
      onClearTrigger?.();
    }
  }, [openTrigger]);

  const handleDelete = async (c: ApiComplaint) => {
    if (!confirm('Delete this complaint?')) return;
    try {
      await deleteComplaint(c.id);
      toast?.('Complaint deleted');
      load(filter !== 'all' ? filter : undefined);
      onCountChange?.();
    } catch (err: any) {
      toast?.(err.message, 'error');
    }
  };

  const handleFilterChange = (f: typeof filter) => {
    setFilter(f);
    load(f !== 'all' ? f : undefined);
  };

  const allCounts = {
    all:         total,
    open:        complaints.filter((c) => c.status === 'open').length,
    in_progress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved:    complaints.filter((c) => c.status === 'resolved').length,
  };

  const TABS: { id: 'all' | ComplaintStatus; label: string }[] = [
    { id: 'all',         label: 'All' },
    { id: 'open',        label: 'Open' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'resolved',    label: 'Resolved' },
  ];

  return (
    <div>
      <PageHeader
        title="Complaints & Maintenance"
        subtitle="Track and resolve resident-reported issues"
        actions={<Button icon={IconPlus} onClick={() => setDrawerOpen(true)}>Add Complaint</Button>}
      />

      <div className="mb-5 inline-flex flex-wrap rounded-lg border border-slate-200 bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => handleFilterChange(t.id)}
            className={`h-9 px-4 rounded-md text-[13px] font-medium inline-flex items-center gap-2 transition ${
              filter === t.id ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label}
            <span className={`text-[11px] rounded-full px-1.5 py-0.5 font-semibold ${filter === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {allCounts[t.id]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {complaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} onUpdate={(c) => setEditing(c)} onDelete={handleDelete} />
          ))}
          {complaints.length === 0 && (
            <Card className="p-12 col-span-full text-center text-slate-500 text-sm">No complaints in this view.</Card>
          )}
        </div>
      )}

      <AddComplaintDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        students={students}
        onSaved={() => { load(filter !== 'all' ? filter : undefined); onCountChange?.(); }}
      />
      <UpdateStatusModal
        open={!!editing}
        onClose={() => setEditing(null)}
        complaint={editing}
        onSaved={() => { load(filter !== 'all' ? filter : undefined); onCountChange?.(); }}
      />
    </div>
  );
};
