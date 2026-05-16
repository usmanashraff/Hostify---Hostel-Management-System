'use client';

import React, { useState, useEffect } from 'react';
import { Badge, Card, Button, Field, Input, Select, Textarea, Drawer, PageHeader, useToast } from '@/components/ui';
import { IconPlus, IconBell, IconEdit, IconTrash, type IconProps } from '@/components/icons';
import { getNotices, createNotice, updateNotice, deleteNotice } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import type { ApiNotice, Priority } from '@/types';

const PRIORITY_META: Record<Priority, { tone: 'gray' | 'blue' | 'orange' | 'red'; label: string; border: string; bg: string }> = {
  low:    { tone: 'gray',   label: 'Low',    border: 'border-slate-200',  bg: '' },
  normal: { tone: 'blue',   label: 'Normal', border: 'border-brand-200',  bg: 'bg-brand-50/30' },
  high:   { tone: 'orange', label: 'High',   border: 'border-amber-300',  bg: 'bg-amber-50/30' },
  urgent: { tone: 'red',    label: 'Urgent', border: 'border-rose-400',   bg: 'bg-rose-50/30' },
};

// ── NoticeDrawer ──────────────────────────────────────────────────────────────
interface NoticeDrawerProps {
  open:     boolean;
  onClose:  () => void;
  editing:  ApiNotice | null;
  posterId: string;
  onSaved:  () => void;
}
const NoticeDrawer = ({ open, onClose, editing, posterId, onSaved }: NoticeDrawerProps) => {
  const [form, setForm] = useState({
    title: '', content: '', priority: 'normal' as Priority, expiresAt: '',
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        title:     editing.title,
        content:   editing.content,
        priority:  editing.priority,
        expiresAt: editing.expiresAt ? new Date(editing.expiresAt).toISOString().slice(0, 10) : '',
      });
    } else {
      setForm({ title: '', content: '', priority: 'normal', expiresAt: '' });
    }
  }, [open, editing]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.content) { toast?.('Title and content are required', 'error'); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateNotice(editing.id, {
          title:     form.title,
          content:   form.content,
          priority:  form.priority,
          expiresAt: form.expiresAt || undefined,
        });
        toast?.('Notice updated');
      } else {
        await createNotice({
          title:      form.title,
          content:    form.content,
          priority:   form.priority,
          expiresAt:  form.expiresAt || undefined,
          postedById: posterId,
        });
        toast?.('Notice published');
      }
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
      title={editing ? 'Edit Notice' : 'Post New Notice'}
      subtitle={editing ? 'Update notice content' : 'Publish a notice for all hostel residents'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Publish'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title" required>
          <Input value={form.title} onChange={set('title')} placeholder="Notice title" />
        </Field>
        <Field label="Content" required>
          <Textarea rows={6} value={form.content} onChange={set('content')} placeholder="Write the notice content here…" />
        </Field>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Priority">
            <Select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </Field>
          <Field label="Expires On">
            <Input type="date" value={form.expiresAt} onChange={set('expiresAt')} />
          </Field>
        </div>
      </div>
    </Drawer>
  );
};

// ── NoticeCard ────────────────────────────────────────────────────────────────
interface NoticeCardProps {
  notice:    ApiNotice;
  onEdit:    (n: ApiNotice) => void;
  onToggle:  (n: ApiNotice) => void;
  onDelete:  (n: ApiNotice) => void;
}
const NoticeCard = ({ notice, onEdit, onToggle, onDelete }: NoticeCardProps) => {
  const pm = PRIORITY_META[notice.priority];
  return (
    <Card className={`p-5 border-l-4 ${pm.border} ${pm.bg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge tone={pm.tone}>{pm.label}</Badge>
            {!notice.isActive && <Badge tone="gray">Inactive</Badge>}
            {notice.expiresAt && <span className="text-[11px] text-slate-500">Expires {formatDate(notice.expiresAt)}</span>}
          </div>
          <h3 className="text-[15px] font-semibold text-slate-900">{notice.title}</h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">{notice.content}</p>
          <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
            <span>Posted by {notice.postedByName ?? '—'}</span>
            <span>·</span>
            <span>{formatDate(notice.publishedAt)}</span>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onEdit(notice)}
            className="h-8 w-8 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition"
            title="Edit"
          >
            <IconEdit size={15} />
          </button>
          <button
            onClick={() => onToggle(notice)}
            className="h-8 px-2 rounded-md hover:bg-slate-100 text-xs font-medium text-slate-500 hover:text-slate-700 transition"
            title={notice.isActive ? 'Deactivate' : 'Activate'}
          >
            {notice.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => onDelete(notice)}
            className="h-8 w-8 rounded-md hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-600 transition"
            title="Delete"
          >
            <IconTrash size={15} />
          </button>
        </div>
      </div>
    </Card>
  );
};

// ── NoticesPage ───────────────────────────────────────────────────────────────
interface NoticesPageProps { onCountChange?: () => void; }
export const NoticesPage = ({ onCountChange }: NoticesPageProps) => {
  const [notices,    setNotices]    = useState<ApiNotice[]>([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing,    setEditing]    = useState<ApiNotice | null>(null);
  const { data: session } = useSession();
  const toast = useToast();

  const posterId = (session?.user as any)?.id ?? '';

  const load = () => {
    setLoading(true);
    const params: Record<string, string> = { limit: '100' };
    if (filter === 'active')   params.isActive  = 'true';
    if (filter === 'inactive') params.isActive  = 'false';
    if (filter === 'urgent' || filter === 'high' || filter === 'normal' || filter === 'low') params.priority = filter;
    getNotices(params)
      .then((r) => { setNotices(r.data); setTotal(r.total); })
      .catch((err) => toast?.(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleToggle = async (n: ApiNotice) => {
    try {
      await updateNotice(n.id, { isActive: !n.isActive });
      toast?.(n.isActive ? 'Notice deactivated' : 'Notice activated');
      load();
      onCountChange?.();
    } catch (err: any) {
      toast?.(err.message, 'error');
    }
  };

  const handleDelete = async (n: ApiNotice) => {
    if (!confirm('Delete this notice?')) return;
    try {
      await deleteNotice(n.id);
      toast?.('Notice deleted');
      load();
      onCountChange?.();
    } catch (err: any) {
      toast?.(err.message, 'error');
    }
  };

  const activeCount = notices.filter((n) => n.isActive).length;

  return (
    <div>
      <PageHeader
        title="Notices & Announcements"
        subtitle={`${total} notices · ${activeCount} active`}
        actions={<Button icon={IconPlus} onClick={() => { setEditing(null); setDrawerOpen(true); }}>Post Notice</Button>}
      />

      <div className="mb-5 flex items-center gap-3 flex-wrap">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          {[
            { id: '',         label: 'All' },
            { id: 'active',   label: 'Active' },
            { id: 'urgent',   label: 'Urgent' },
            { id: 'high',     label: 'High' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`h-8 px-3.5 rounded-md text-[13px] font-medium transition ${
                filter === t.id ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((n) => (
            <NoticeCard
              key={n.id}
              notice={n}
              onEdit={(n) => { setEditing(n); setDrawerOpen(true); }}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
          {notices.length === 0 && (
            <Card className="p-12 text-center text-slate-500 text-sm">No notices found.</Card>
          )}
        </div>
      )}

      <NoticeDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditing(null); }}
        editing={editing}
        posterId={posterId}
        onSaved={() => { load(); onCountChange?.(); }}
      />
    </div>
  );
};
