'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Avatar, Badge, Card, Button, IconButton, Field, Input, Select, Drawer, Modal, PageHeader, Detail, useToast } from '@/components/ui';
import { IconPlus, IconSearch, IconEye, IconEdit, IconTrash, IconUpload } from '@/components/icons';
import { getStudents, getRooms, createStudent, updateStudent, deleteStudent } from '@/lib/api';
import { bedLetter, bedNumber, avatarHue, formatDate, FEE_STATUS_BADGE, ROOM_TYPE_LABEL, floorLabel } from '@/lib/utils';
import type { ApiStudent, ApiRoom, CreateStudentInput, UpdateStudentInput } from '@/types';

// ── StudentDrawer ─────────────────────────────────────────────────────────────
interface StudentDrawerProps {
  open:     boolean;
  onClose:  () => void;
  rooms:    ApiRoom[];
  editing:  ApiStudent | null;
  onSaved:  () => void;
}
const StudentDrawer = ({ open, onClose, rooms, editing, onSaved }: StudentDrawerProps) => {
  const [form, setForm] = useState({
    fullName: '', fatherName: '', cnic: '', phone: '', email: '',
    roomId: '', bedNo: '', joiningDate: new Date().toISOString().slice(0, 10),
    photoUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        fullName:    editing.fullName,
        fatherName:  editing.fatherName,
        cnic:        editing.cnic,
        phone:       editing.phone,
        email:       editing.email ?? '',
        roomId:      editing.roomId,
        bedNo:       String(editing.bedNo),
        joiningDate: editing.joiningDate.slice(0, 10),
        photoUrl:    editing.photoUrl ?? '',
      });
    } else {
      setForm({ fullName: '', fatherName: '', cnic: '', phone: '', email: '', roomId: '', bedNo: '', joiningDate: new Date().toISOString().slice(0, 10), photoUrl: '' });
    }
  }, [open, editing]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast?.('File is too large (max 2MB)', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      setForm(f => ({ ...f, photoUrl: data.photoUrl }));
      toast?.('Photo uploaded successfully');
    } catch (err: any) {
      toast?.(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const selectedRoom = rooms.find((r) => r.id === form.roomId);
  const bedsForRoom = useMemo(() => {
    if (!selectedRoom) return [];
    return Array.from({ length: selectedRoom.capacity }, (_, i) => {
      const n    = i + 1;
      const bed  = selectedRoom.beds?.find((b) => b.bedNo === n);
      const ownBed = editing?.bedNo === n && editing?.roomId === form.roomId;
      return { n, letter: bedLetter(n), taken: (bed?.isOccupied ?? false) && !ownBed };
    });
  }, [selectedRoom, form.roomId, editing]);

  const handleSubmit = async () => {
    if (!form.fullName || !form.fatherName || !form.cnic || !form.phone || !form.roomId || !form.bedNo) {
      toast?.('Please fill all required fields', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const data: UpdateStudentInput = {
          fullName:    form.fullName,
          fatherName:  form.fatherName,
          phone:       form.phone,
          email:       form.email || undefined,
          roomId:      form.roomId,
          bedNo:       Number(form.bedNo),
          joiningDate: form.joiningDate,
          photoUrl:    form.photoUrl || undefined,
        };
        await updateStudent(editing.id, data);
        toast?.('Student updated successfully');
      } else {
        const data: CreateStudentInput = {
          fullName:    form.fullName,
          fatherName:  form.fatherName,
          cnic:        form.cnic,
          phone:       form.phone,
          email:       form.email || undefined,
          roomId:      form.roomId,
          bedNo:       Number(form.bedNo),
          joiningDate: form.joiningDate,
          photoUrl:    form.photoUrl || undefined,
        };
        await createStudent(data);
        toast?.('Student registered successfully');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast?.(err.message || 'Failed to save student', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Student' : 'Add New Student'}
      subtitle={editing ? `Update details for ${editing.fullName}` : 'Enroll a new resident into the hostel'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || uploading}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Add Student'}</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50">
            {form.photoUrl ? (
              <img src={form.photoUrl} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <IconUpload className="text-slate-400" size={20} />
            )}
          </div>
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleUpload} 
            />
            <Button 
              variant="secondary" 
              size="sm" 
              icon={IconUpload} 
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? 'Uploading…' : 'Upload Photo'}
            </Button>
            <p className="text-xs text-slate-500 mt-1.5">JPG or PNG, max 2MB</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Full Name" required className="col-span-2">
            <Input value={form.fullName} onChange={set('fullName')} placeholder="e.g. Ahmed Raza" />
          </Field>
          <Field label="Father Name" required>
            <Input value={form.fatherName} onChange={set('fatherName')} placeholder="Muhammad Raza" />
          </Field>
          <Field label="CNIC" required>
            <Input value={form.cnic} onChange={set('cnic')} placeholder="00000-0000000-0" disabled={!!editing} />
          </Field>
          <Field label="Phone" required>
            <Input value={form.phone} onChange={set('phone')} placeholder="+92 300 1234567" />
          </Field>
          <Field label="Email">
            <Input value={form.email} onChange={set('email')} placeholder="student@uni.edu.pk" />
          </Field>
          <Field label="Room Assignment" required>
            <Select value={form.roomId} onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value, bedNo: '' }))}>
              <option value="">Select room</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.roomNumber} — {ROOM_TYPE_LABEL[r.type] ?? r.type} ({floorLabel(r.floor)})
                  {r.occupied >= r.capacity ? ' [FULL]' : ` (${r.capacity - r.occupied} free)`}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Bed No" required>
            <Select value={form.bedNo} onChange={set('bedNo')} disabled={!form.roomId}>
              <option value="">{form.roomId ? 'Select bed' : 'Pick a room first'}</option>
              {bedsForRoom.map((b) => (
                <option key={b.n} value={b.n} disabled={b.taken}>
                  Bed {b.letter}{b.taken ? ' (occupied)' : ''}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Joining Date" required className="col-span-2">
            <Input type="date" value={form.joiningDate} onChange={set('joiningDate')} />
          </Field>
        </div>
      </div>
    </Drawer>
  );
};

// ── StudentsPage ──────────────────────────────────────────────────────────────
interface StudentsPageProps {
  openTrigger?:    number;
  onClearTrigger?: () => void;
  onCountChange?:  () => void;
}
export const StudentsPage = ({ openTrigger = 0, onClearTrigger, onCountChange }: StudentsPageProps) => {
  const [students,     setStudents]     = useState<ApiStudent[]>([]);
  const [rooms,        setRooms]        = useState<ApiRoom[]>([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [roomFilter,   setRoomFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [editing,      setEditing]      = useState<ApiStudent | null>(null);
  const [viewing,      setViewing]      = useState<ApiStudent | null>(null);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search)       params.search    = search;
    if (roomFilter)   params.roomId    = roomFilter;
    if (statusFilter) params.feeStatus = statusFilter;
    getStudents(params)
      .then((res) => { setStudents(res.data); setTotal(res.total); })
      .catch((err) => toast?.(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getRooms({ limit: '100' }).then((r) => setRooms(r.data)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [search, roomFilter, statusFilter]);

  useEffect(() => {
    if (openTrigger > 0) {
      setEditing(null);
      setDrawerOpen(true);
      onClearTrigger?.();
    }
  }, [openTrigger]);

  const handleDelete = async (s: ApiStudent) => {
    if (!confirm(`Remove ${s.fullName} from the hostel?`)) return;
    try {
      await deleteStudent(s.id);
      toast?.(`${s.fullName} removed`);
      load();
      onCountChange?.();
    } catch (err: any) {
      toast?.(err.message, 'error');
    }
  };

  const feeStatus = (s: ApiStudent) => s.fees?.[0]?.status ?? 'unpaid';

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${total} residents enrolled`}
        actions={<Button icon={IconPlus} onClick={() => { setEditing(null); setDrawerOpen(true); }}>Add Student</Button>}
      />

      <Card className="p-3 mb-4">
        <div className="flex flex-col md:flex-row gap-2.5">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone or CNIC…"
              className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>
          <div className="flex gap-2.5">
            <Select value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)} className="w-40">
              <option value="">All Rooms</option>
              {rooms.map((r) => <option key={r.id} value={r.id}>Room {r.roomNumber}</option>)}
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44">
              <option value="">All Fee Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto nice-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Student</th>
                <th className="px-3 py-3">Room</th>
                <th className="px-3 py-3">Bed</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">Fee Status</th>
                <th className="px-3 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-5 py-3">
                      <div className="h-9 rounded-lg bg-slate-100 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : students.map((s) => {
                const fs  = feeStatus(s);
                const fsb = FEE_STATUS_BADGE[fs] ?? FEE_STATUS_BADGE.unpaid;
                const hue = avatarHue(s.id);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.fullName} hue={hue} size={36} src={s.photoUrl} />
                        <div>
                          <div className="font-medium text-slate-900">{s.fullName}</div>
                          <div className="text-xs text-slate-500">s/o {s.fatherName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-700 font-medium">{s.room?.roomNumber ?? '—'}</td>
                    <td className="px-3 py-3 text-slate-700">{bedLetter(s.bedNo)}</td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{s.phone}</td>
                    <td className="px-3 py-3"><Badge tone={fsb.tone} dot>{fsb.label}</Badge></td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{formatDate(s.joiningDate)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <IconButton icon={IconEye}   label="View"   onClick={() => setViewing(s)} />
                        <IconButton icon={IconEdit}  label="Edit"   onClick={() => { setEditing(s); setDrawerOpen(true); }} />
                        <IconButton icon={IconTrash} label="Delete" tone="danger" onClick={() => handleDelete(s)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && students.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500 text-sm">No students match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
          <span>Showing <span className="font-medium text-slate-700">{students.length}</span> of {total} students</span>
        </div>
      </Card>

      <StudentDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        rooms={rooms}
        editing={editing}
        onSaved={() => { load(); onCountChange?.(); }}
      />

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Student Details" maxWidth="max-w-md">
        {viewing && (() => {
          const fs  = feeStatus(viewing);
          const fsb = FEE_STATUS_BADGE[fs] ?? FEE_STATUS_BADGE.unpaid;
          const hue = avatarHue(viewing.id);
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar name={viewing.fullName} hue={hue} size={64} src={viewing.photoUrl} />
                <div>
                  <div className="text-lg font-semibold text-slate-900">{viewing.fullName}</div>
                  <div className="text-sm text-slate-500">{viewing.cnic}</div>
                  <div className="mt-1"><Badge tone={fsb.tone} dot>{fsb.label}</Badge></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Detail label="Father Name" value={viewing.fatherName} />
                <Detail label="CNIC"        value={viewing.cnic} />
                <Detail label="Phone"       value={viewing.phone} />
                <Detail label="Email"       value={viewing.email ?? '—'} />
                <Detail label="Room"        value={`Room ${viewing.room?.roomNumber ?? '—'}`} />
                <Detail label="Bed"         value={`Bed ${bedLetter(viewing.bedNo)}`} />
                <Detail label="Joined"      value={formatDate(viewing.joiningDate)} />
                <Detail label="Status"      value={viewing.status} />
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};
