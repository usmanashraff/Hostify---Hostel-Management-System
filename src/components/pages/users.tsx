'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, Badge, Card, Button, IconButton, Field, Input, Select, Drawer, PageHeader, Detail, useToast } from '@/components/ui';
import { IconPlus, IconSearch, IconEdit, IconShield } from '@/components/icons';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/api';
import { avatarHue, formatDate } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import type { User, UserRole } from '@/types';

const ROLE_META: Record<UserRole, { tone: 'violet' | 'blue' | 'gray'; label: string }> = {
  admin:   { tone: 'violet', label: 'Admin' },
  warden:  { tone: 'blue',   label: 'Warden' },
  staff:   { tone: 'gray',   label: 'Staff' },
};

// ── UserDrawer ────────────────────────────────────────────────────────────────
interface UserDrawerProps {
  open:    boolean;
  onClose: () => void;
  editing: User | null;
  onSaved: () => void;
}
const UserDrawer = ({ open, onClose, editing, onSaved }: UserDrawerProps) => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', role: 'staff' as UserRole, password: '',
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({ name: editing.name, email: editing.email, phone: editing.phone ?? '', role: editing.role, password: '' });
    } else {
      setForm({ name: '', email: '', phone: '', role: 'staff', password: '' });
    }
  }, [open, editing]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || (!editing && !form.password)) {
      toast?.('Name, email, and password are required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const data: any = { name: form.name, phone: form.phone || undefined, role: form.role };
        if (form.password) data.password = form.password;
        await updateUser(editing.id, data);
        toast?.('User updated successfully');
      } else {
        await createUser({ name: form.name, email: form.email, phone: form.phone || undefined, password: form.password, role: form.role });
        toast?.('Staff account created');
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
      title={editing ? 'Edit Staff Account' : 'Add Staff Member'}
      subtitle={editing ? `Update details for ${editing.name}` : 'Create a new hostel staff account'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Account'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Full Name" required className="col-span-2">
            <Input value={form.name} onChange={set('name')} placeholder="e.g. Muhammad Ali" />
          </Field>
          <Field label="Email" required className="col-span-2">
            <Input type="email" value={form.email} onChange={set('email')} placeholder="staff@hostel.com" disabled={!!editing} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={set('phone')} placeholder="+92 300 0000000" />
          </Field>
          <Field label="Role" required>
            <Select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}>
              <option value="staff">Staff</option>
              <option value="warden">Warden</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
          <Field label={editing ? 'New Password (optional)' : 'Password'} required={!editing} className="col-span-2">
            <Input type="password" value={form.password} onChange={set('password')} placeholder={editing ? 'Leave blank to keep current' : 'Min 8 characters'} />
          </Field>
        </div>
      </div>
    </Drawer>
  );
};

// ── UsersPage ─────────────────────────────────────────────────────────────────
export const UsersPage = () => {
  const [users,      setUsers]      = useState<User[]>([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing,    setEditing]    = useState<User | null>(null);
  const { data: session } = useSession();
  const toast = useToast();

  const currentUserId = (session?.user as any)?.id ?? '';
  const isAdmin = (session?.user as any)?.role === 'admin';

  const load = () => {
    setLoading(true);
    const params: Record<string, string> = { limit: '100' };
    if (search)     params.search = search;
    if (roleFilter) params.role   = roleFilter;
    getUsers(params)
      .then((r) => { setUsers(r.data); setTotal(r.total); })
      .catch((err) => toast?.(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { load(); }, [search, roleFilter]);

  const handleDeactivate = async (u: User) => {
    if (u.id === currentUserId) { toast?.('Cannot deactivate your own account', 'error'); return; }
    if (!confirm(`${u.isActive ? 'Deactivate' : 'Activate'} ${u.name}?`)) return;
    try {
      await updateUser(u.id, { isActive: !u.isActive });
      toast?.(u.isActive ? `${u.name} deactivated` : `${u.name} activated`);
      load();
    } catch (err: any) {
      toast?.(err.message, 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="Staff & Users"
        subtitle={`${total} staff accounts`}
        actions={isAdmin ? <Button icon={IconPlus} onClick={() => { setEditing(null); setDrawerOpen(true); }}>Add Staff</Button> : undefined}
      />

      {!isAdmin && (
        <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
          Only admins can manage staff accounts. You can view the list below.
        </div>
      )}

      <Card className="p-3 mb-4">
        <div className="flex flex-col md:flex-row gap-2.5">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-40">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="warden">Warden</option>
            <option value="staff">Staff</option>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto nice-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Staff Member</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">Last Login</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-3"><div className="h-9 rounded-lg bg-slate-100 animate-pulse" /></td></tr>
                ))
              ) : users.map((u) => {
                const rm  = ROLE_META[u.role];
                const hue = avatarHue(u.id);
                const isSelf = u.id === currentUserId;
                return (
                  <tr key={u.id} className={`hover:bg-slate-50/60 transition ${!u.isActive ? 'opacity-60' : ''}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} hue={hue} size={36} />
                        <div>
                          <div className="font-medium text-slate-900">
                            {u.name}
                            {isSelf && <span className="ml-1.5 text-[10px] font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">You</span>}
                          </div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3"><Badge tone={rm.tone} dot>{rm.label}</Badge></td>
                    <td className="px-3 py-3 text-slate-600">{u.phone ?? '—'}</td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{formatDate(u.lastLogin)}</td>
                    <td className="px-3 py-3">
                      <Badge tone={u.isActive ? 'green' : 'gray'} dot>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-1">
                          <IconButton icon={IconEdit} label="Edit" onClick={() => { setEditing(u); setDrawerOpen(true); }} />
                          {!isSelf && (
                            <button
                              onClick={() => handleDeactivate(u)}
                              className={`text-xs font-medium px-2 py-1 rounded transition ${
                                u.isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!loading && users.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500 text-sm">No staff members found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
          {total} staff accounts total
        </div>
      </Card>

      <UserDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditing(null); }}
        editing={editing}
        onSaved={load}
      />
    </div>
  );
};
