'use client';

import React, { useState, useEffect } from 'react';
import { Badge, Card, Button, Field, Input, Select, Modal, PageHeader, useToast } from '@/components/ui';
import { IconPlus, IconDownload, IconTrash } from '@/components/icons';
import { getRooms, createRoom, deleteRoom } from '@/lib/api';
import { bedLetter, avatarHue, ROOM_TYPE_LABEL, floorLabel } from '@/lib/utils';
import type { ApiRoom, CreateRoomInput } from '@/types';

// ── BedCell ───────────────────────────────────────────────────────────────────
interface BedCellProps { bedNo: number; isOccupied: boolean; studentName?: string; }
const BedCell = ({ bedNo, isOccupied, studentName }: BedCellProps) => (
  <div
    className={`rounded-md p-2 text-[11px] font-medium border ${
      isOccupied ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-slate-50 border-slate-200 text-slate-400'
    }`}
    title={studentName ?? 'Vacant'}
  >
    <div className="flex items-center justify-between">
      <span>Bed {bedLetter(bedNo)}</span>
      <span className={`h-1.5 w-1.5 rounded-full ${isOccupied ? 'bg-brand-500' : 'bg-slate-300'}`} />
    </div>
    <div className="mt-1 text-[10px] text-slate-500 truncate">{studentName ?? 'Vacant'}</div>
  </div>
);

// ── AddRoomModal ──────────────────────────────────────────────────────────────
interface AddRoomModalProps { open: boolean; onClose: () => void; onSaved: () => void; }
const AddRoomModal = ({ open, onClose, onSaved }: AddRoomModalProps) => {
  const [form, setForm] = useState({ roomNumber: '', floor: '1', type: '4-bed' as CreateRoomInput['type'] });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.roomNumber) { toast?.('Room number is required', 'error'); return; }
    setSaving(true);
    try {
      await createRoom({ roomNumber: form.roomNumber, floor: Number(form.floor), type: form.type });
      toast?.('Room created successfully');
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
      title="Add New Room"
      maxWidth="max-w-sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Creating…' : 'Create Room'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Room Number" required>
          <Input value={form.roomNumber} onChange={set('roomNumber')} placeholder="e.g. 101" />
        </Field>
        <Field label="Floor" required>
          <Input type="number" min={1} max={10} value={form.floor} onChange={set('floor')} />
        </Field>
        <Field label="Room Type" required>
          <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}>
            <option value="2-bed">2-Bed</option>
            <option value="4-bed">4-Bed</option>
            <option value="6-bed">6-Bed</option>
          </Select>
        </Field>
      </div>
    </Modal>
  );
};

// ── RoomCard ──────────────────────────────────────────────────────────────────
interface RoomCardProps {
  room: ApiRoom;
  expanded: boolean;
  onToggle: () => void;
  onDelete: (r: ApiRoom) => void;
}
const RoomCard = ({ room, expanded, onToggle, onDelete }: RoomCardProps) => {
  const occ  = room.occupied;
  const pct  = Math.round((occ / room.capacity) * 100);
  const full  = occ === room.capacity;
  const empty = occ === 0;
  const gridCols = room.capacity <= 2 ? 'grid-cols-2' : room.capacity === 4 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <Card className={`overflow-hidden transition ${expanded ? 'ring-2 ring-brand-500/30' : ''}`}>
      <button onClick={onToggle} className="w-full text-left">
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-semibold text-sm">
                {room.roomNumber}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Room {room.roomNumber}</div>
                <div className="text-xs text-slate-500">{floorLabel(room.floor)} · {ROOM_TYPE_LABEL[room.type] ?? room.type}</div>
              </div>
            </div>
            <Badge tone={full ? 'red' : empty ? 'gray' : 'green'} dot>
              {full ? 'Full' : empty ? 'Empty' : 'Available'}
            </Badge>
          </div>

          <div className={`grid gap-2 ${gridCols}`}>
            {room.beds?.map((b) => (
              <BedCell key={b.bedNo} bedNo={b.bedNo} isOccupied={b.isOccupied} studentName={b.studentName} />
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Occupancy</span>
              <span className="font-semibold text-slate-900">{occ}/{room.capacity}</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className={`h-full ${full ? 'bg-rose-500' : 'bg-brand-600'}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 fade-in">
          <div className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Residents</div>
          {(room.students ?? []).length === 0 ? (
            <div className="text-sm text-slate-500 italic">No residents assigned yet.</div>
          ) : (
            <ul className="space-y-2">
              {(room.students ?? []).map((s) => (
                <li key={s.id} className="flex items-center gap-3 bg-white rounded-lg border border-slate-200 p-2.5">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    style={{ background: `hsl(${avatarHue(s.id)},65%,55%)` }}>
                    {s.fullName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{s.fullName}</div>
                    <div className="text-[11px] text-slate-500">Bed {bedLetter(s.bedNo)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">{room.capacity - occ} bed(s) available</span>
            <div className="flex items-center gap-3">
              {empty && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(room); }}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <IconTrash size={12} /> Delete room
                </button>
              )}
              <button onClick={onToggle} className="text-brand-600 font-medium hover:text-brand-700">Collapse ↑</button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// ── RoomsPage ─────────────────────────────────────────────────────────────────
interface RoomsPageProps { onCountChange?: () => void; }
export const RoomsPage = ({ onCountChange }: RoomsPageProps) => {
  const [rooms,      setRooms]      = useState<ApiRoom[]>([]);
  const [filter,     setFilter]     = useState<'all' | 'available' | 'full'>('all');
  const [expanded,   setExpanded]   = useState<string | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [addOpen,    setAddOpen]    = useState(false);
  const toast = useToast();

  const load = (f?: string) => {
    setLoading(true);
    const params: Record<string, string> = { limit: '100' };
    if (f && f !== 'all') params.filter = f;
    getRooms(params)
      .then((r) => setRooms(r.data))
      .catch((err) => toast?.(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleFilterChange = (f: typeof filter) => {
    setFilter(f);
    load(f);
  };

  const handleDelete = async (room: ApiRoom) => {
    if (!confirm(`Delete Room ${room.roomNumber}? This cannot be undone.`)) return;
    try {
      await deleteRoom(room.id);
      toast?.(`Room ${room.roomNumber} deleted`);
      load(filter);
      onCountChange?.();
    } catch (err: any) {
      toast?.(err.message, 'error');
    }
  };

  const totalBeds = rooms.reduce((s, r) => s + r.capacity, 0);
  const occupied  = rooms.reduce((s, r) => s + r.occupied, 0);
  const fullRooms = rooms.filter((r) => r.occupied === r.capacity).length;

  const TABS = [
    { id: 'all' as const,       label: 'All Rooms' },
    { id: 'available' as const, label: 'Available' },
    { id: 'full' as const,      label: 'Full' },
  ];

  return (
    <div>
      <PageHeader
        title="Rooms & Beds"
        subtitle={`${rooms.length} rooms · ${totalBeds} beds · ${occupied} occupied`}
        actions={
          <Button icon={IconPlus} onClick={() => setAddOpen(true)}>Add Room</Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Rooms', value: rooms.length,  color: 'text-slate-900' },
          { label: 'Total Beds',  value: totalBeds,      color: 'text-slate-900' },
          { label: 'Occupied',    value: occupied,        color: 'text-brand-600' },
          { label: 'Full Rooms',  value: fullRooms,       color: 'text-rose-600' },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{item.label}</div>
            <div className={`mt-1 text-2xl font-semibold ${item.color}`}>{loading ? '—' : item.value}</div>
          </Card>
        ))}
      </div>

      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleFilterChange(t.id)}
              className={`h-8 px-3.5 rounded-md text-[13px] font-medium transition ${
                filter === t.id ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-500" /> Occupied</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" /> Vacant</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-52 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((r) => (
            <RoomCard
              key={r.id}
              room={r}
              expanded={expanded === r.id}
              onToggle={() => setExpanded(expanded === r.id ? null : r.id)}
              onDelete={handleDelete}
            />
          ))}
          {rooms.length === 0 && (
            <Card className="col-span-full p-12 text-center text-slate-500 text-sm">
              No rooms found.
            </Card>
          )}
        </div>
      )}

      <AddRoomModal open={addOpen} onClose={() => setAddOpen(false)} onSaved={() => { load(filter); onCountChange?.(); }} />
    </div>
  );
};
