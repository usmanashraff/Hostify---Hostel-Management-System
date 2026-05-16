'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, Badge, Card, Button, Field, Input, Select, Textarea, Modal, PageHeader, Detail, useToast } from '@/components/ui';
import { IconCheck, IconClock, IconUsers, IconHome, IconPrinter, IconDownload, IconReceipt } from '@/components/icons';
import { getFees, getStudents, recordPayment } from '@/lib/api';
import { bedLetter, avatarHue, formatDate, formatPKR, monthLabel, FEE_AMOUNT, FEE_STATUS_BADGE } from '@/lib/utils';
import type { ApiStudent, ApiFee, RecordPaymentInput } from '@/types';

// ── PaymentModal ──────────────────────────────────────────────────────────────
interface PaymentModalProps {
  open:         boolean;
  onClose:      () => void;
  student:      ApiStudent | null;
  defaultMonth: string;
  onSaved:      (fee: ApiFee) => void;
}
const PaymentModal = ({ open, onClose, student, defaultMonth, onSaved }: PaymentModalProps) => {
  const [form, setForm] = useState({
    amount: FEE_AMOUNT, month: defaultMonth,
    paymentMode: 'cash' as RecordPaymentInput['paymentMode'],
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (open) setForm({ amount: FEE_AMOUNT, month: defaultMonth, paymentMode: 'cash', notes: '' });
  }, [open, defaultMonth]);

  if (!student) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await recordPayment({
        studentId:   student.id,
        amount:      form.amount,
        month:       form.month,
        paymentMode: form.paymentMode,
        notes:       form.notes,
      });
      if (!res.data) throw new Error('No data returned');
      toast?.(`Payment of ${formatPKR(form.amount)} recorded for ${student.fullName}`);
      onSaved(res.data);
      onClose();
    } catch (err: any) {
      toast?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const hue = avatarHue(student.id);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record Payment"
      subtitle={`Logging fee for ${student.fullName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save payment'}</Button>
        </>
      }
    >
      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 mb-5">
        <Avatar name={student.fullName} hue={hue} size={44} />
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-900">{student.fullName}</div>
          <div className="text-xs text-slate-500">Room {student.room?.roomNumber ?? '—'} · Bed {bedLetter(student.bedNo)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <Field label="Amount (Rs.)" required>
          <Input
            type="number"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
          />
        </Field>
        <Field label="Month" required>
          <Input type="month" value={form.month} onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))} />
        </Field>
        <Field label="Payment Mode" required className="col-span-2">
          <div className="grid grid-cols-3 gap-2">
            {(['cash', 'bank_transfer', 'online'] as const).map((m) => {
              const labels = { cash: 'Cash', bank_transfer: 'Bank Transfer', online: 'Online' };
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, paymentMode: m }))}
                  className={`h-10 rounded-lg border text-sm font-medium transition ${
                    form.paymentMode === m ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {labels[m]}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Notes" className="col-span-2">
          <Textarea placeholder="Optional remarks" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </Field>
      </div>
    </Modal>
  );
};

// ── ReceiptModal ──────────────────────────────────────────────────────────────
interface ReceiptModalProps { open: boolean; onClose: () => void; fee: ApiFee | null; student: ApiStudent | null; }
const ReceiptModal = ({ open, onClose, fee, student }: ReceiptModalProps) => {
  if (!fee || !student) return null;
  const receiptNo = `HST-${fee.month?.replace('-', '')}-${student.id.slice(-4).toUpperCase()}`;
  const modeLabels: Record<string, string> = { cash: 'Cash', bank_transfer: 'Bank Transfer', online: 'Online' };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Payment Receipt"
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button icon={IconPrinter} onClick={() => window.print()}>Print</Button>
          <Button variant="secondary" icon={IconDownload}>Download PDF</Button>
        </>
      }
    >
      <div className="border border-dashed border-slate-300 rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-brand-600 text-white flex items-center justify-center">
              <IconHome size={18} stroke={2} />
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-sm">Hostelite</div>
              <div className="text-[11px] text-slate-500">Boys Hostel · Block A</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-500">Receipt</div>
            <div className="text-sm font-semibold text-slate-900">{receiptNo}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 py-4 text-sm">
          <Detail label="Resident"     value={student.fullName} />
          <Detail label="Room / Bed"   value={`Room ${student.room?.roomNumber ?? '—'} · Bed ${bedLetter(student.bedNo)}`} />
          <Detail label="Month"        value={monthLabel(fee.month)} />
          <Detail label="Payment Mode" value={modeLabels[fee.paymentMode ?? ''] ?? '—'} />
          <Detail label="Date"         value={formatDate(fee.paymentDate)} />
        </div>
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
          <span className="text-sm text-slate-600">Amount Paid</span>
          <span className="text-lg font-semibold text-emerald-600">{formatPKR(fee.amount)}</span>
        </div>
        <div className="mt-4 text-[11px] text-slate-400 italic text-center">
          Thank you for your payment. Please retain this receipt for your records.
        </div>
      </div>
    </Modal>
  );
};

// ── FeesPage ──────────────────────────────────────────────────────────────────
interface FeesPageProps {
  openTrigger?:    number;
  onClearTrigger?: () => void;
  onCountChange?:  () => void;
}
export const FeesPage = ({ openTrigger = 0, onClearTrigger, onCountChange }: FeesPageProps) => {
  const [students,     setStudents]     = useState<ApiStudent[]>([]);
  const [fees,         setFees]         = useState<Record<string, ApiFee>>({});
  const [loading,      setLoading]      = useState(true);
  const [month,        setMonth]        = useState(new Date().toISOString().slice(0, 7));
  const [payingFor,    setPayingFor]    = useState<ApiStudent | null>(null);
  const [viewReceipt,  setViewReceipt]  = useState<{ fee: ApiFee; student: ApiStudent } | null>(null);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([
      getStudents({ status: 'active', limit: '100' }),
      getFees({ month }),
    ]).then(([sRes, fRes]) => {
      setStudents(sRes.data);
      const feeMap: Record<string, ApiFee> = {};
      fRes.data.forEach((f) => { feeMap[f.studentId] = f; });
      setFees(feeMap);
    }).catch((err) => toast?.(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [month]);

  useEffect(() => {
    if (openTrigger > 0 && students.length > 0) {
      setPayingFor(students[0]);
      onClearTrigger?.();
    }
  }, [openTrigger, students]);

  const paidStudents   = students.filter((s) => fees[s.id]?.status === 'paid');
  const collected      = paidStudents.length * FEE_AMOUNT;
  const unpaidStudents = students.filter((s) => !fees[s.id] || fees[s.id].status !== 'paid');
  const pending        = unpaidStudents.length * FEE_AMOUNT;

  return (
    <div>
      <PageHeader
        title="Fee Management"
        subtitle={`Monthly fee collection for ${monthLabel(month)}`}
        actions={
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-48" />
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[12px] font-medium text-slate-500">Total Collected</div>
              <div className="mt-1 text-2xl font-semibold text-emerald-600">{formatPKR(collected)}</div>
              <div className="mt-1 text-xs text-slate-500">{paidStudents.length} students paid</div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><IconCheck size={20} /></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[12px] font-medium text-slate-500">Total Pending</div>
              <div className="mt-1 text-2xl font-semibold text-rose-600">{formatPKR(pending)}</div>
              <div className="mt-1 text-xs text-slate-500">{unpaidStudents.length} students pending</div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"><IconClock size={20} /></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[12px] font-medium text-slate-500">Total Students</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">{students.length}</div>
              <div className="mt-1 text-xs text-slate-500">Standard fee: {formatPKR(FEE_AMOUNT)}/mo</div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><IconUsers size={20} /></div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto nice-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Student</th>
                <th className="px-3 py-3">Room</th>
                <th className="px-3 py-3">Fee Amount</th>
                <th className="px-3 py-3">Month</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Payment Date</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-5 py-3"><div className="h-9 rounded-lg bg-slate-100 animate-pulse" /></td></tr>
                ))
              ) : students.map((s) => {
                const fee   = fees[s.id];
                const fst   = fee?.status ?? 'unpaid';
                const fsb   = FEE_STATUS_BADGE[fst] ?? FEE_STATUS_BADGE.unpaid;
                const hue   = avatarHue(s.id);
                const overdue = fst === 'unpaid';
                return (
                  <tr key={s.id} className={`hover:bg-slate-50/60 transition ${overdue ? 'bg-rose-50/40' : ''}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.fullName} hue={hue} size={32} />
                        <div>
                          <div className="font-medium text-slate-900">{s.fullName}</div>
                          <div className="text-xs text-slate-500">s/o {s.fatherName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-700 font-medium">{s.room?.roomNumber ?? '—'}</td>
                    <td className="px-3 py-3 text-slate-900 font-medium whitespace-nowrap">{formatPKR(FEE_AMOUNT)}</td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{monthLabel(month)}</td>
                    <td className="px-3 py-3">
                      <Badge tone={fsb.tone} dot>{fsb.label}</Badge>
                      {overdue && <span className="ml-2 text-[11px] font-medium text-rose-600">Overdue</span>}
                    </td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{formatDate(fee?.paymentDate)}</td>
                    <td className="px-5 py-3 text-right">
                      {fst === 'paid' ? (
                        <button
                          onClick={() => fee && setViewReceipt({ fee, student: s })}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-brand-700"
                        >
                          <IconReceipt size={14} /> View receipt
                        </button>
                      ) : (
                        <Button size="sm" onClick={() => setPayingFor(s)}>Record Payment</Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <PaymentModal
        open={!!payingFor}
        onClose={() => setPayingFor(null)}
        student={payingFor}
        defaultMonth={month}
        onSaved={(fee) => {
          load();
          onCountChange?.();
          const student = students.find((s) => s.id === fee.studentId);
          if (student) setViewReceipt({ fee, student });
        }}
      />
      <ReceiptModal
        open={!!viewReceipt}
        onClose={() => setViewReceipt(null)}
        fee={viewReceipt?.fee ?? null}
        student={viewReceipt?.student ?? null}
      />
    </div>
  );
};
