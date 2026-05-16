export const bedLetter  = (n: number) => String.fromCharCode(64 + n);
export const bedNumber  = (l: string) => l.toUpperCase().charCodeAt(0) - 64;

export function avatarHue(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % 360;
}

export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function formatPKR(amount: number): string {
  return 'Rs. ' + Math.round(amount).toLocaleString('en-PK');
}

export function monthLabel(month: string): string {
  if (!month) return '—';
  const [y, m] = month.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export const FEE_AMOUNT = 12000;

export const ROOM_TYPE_LABEL: Record<string, string> = {
  TWO_BED: '2-Bed', FOUR_BED: '4-Bed', SIX_BED: '6-Bed',
};

export function floorLabel(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]) + ' Floor';
}

export const FEE_STATUS_BADGE = {
  paid:    { tone: 'green'  as const, label: 'Paid' },
  unpaid:  { tone: 'red'    as const, label: 'Unpaid' },
  partial: { tone: 'orange' as const, label: 'Partial' },
};
