'use client';

import React from 'react';

interface IcoProps {
  size?: number;
  stroke?: number;
  className?: string;
  children?: React.ReactNode;
  d?: string;
}

const Ico = ({ d, size = 20, stroke = 1.75, className = '', children }: IcoProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children || <path d={d} />}
  </svg>
);

export type IconProps = Omit<IcoProps, 'children' | 'd'>;

export const IconDashboard = (p: IconProps) => <Ico {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></Ico>;
export const IconUsers = (p: IconProps) => <Ico {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Ico>;
export const IconBed = (p: IconProps) => <Ico {...p}><path d="M2 19V6"/><path d="M2 11h20v8"/><path d="M22 19v-3a3 3 0 0 0-3-3"/><circle cx="7" cy="11" r="2"/></Ico>;
export const IconWallet = (p: IconProps) => <Ico {...p}><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h16v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7"/><circle cx="17" cy="14" r="1.2"/></Ico>;
export const IconWrench = (p: IconProps) => <Ico {...p}><path d="M14.7 6.3a4 4 0 0 1 5 5l-2.1.5-1.7-1.7L16.4 8 14.7 6.3z"/><path d="m14 8-8.5 8.5a1.5 1.5 0 0 0 2.1 2.1L16 10"/></Ico>;
export const IconSearch = (p: IconProps) => <Ico {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Ico>;
export const IconPlus = (p: IconProps) => <Ico {...p}><path d="M12 5v14M5 12h14"/></Ico>;
export const IconBell = (p: IconProps) => <Ico {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></Ico>;
export const IconFilter = (p: IconProps) => <Ico {...p}><path d="M3 5h18l-7 9v6l-4-2v-4L3 5z"/></Ico>;
export const IconClose = (p: IconProps) => <Ico {...p}><path d="M18 6 6 18M6 6l12 12"/></Ico>;
export const IconChevronDown = (p: IconProps) => <Ico {...p}><path d="m6 9 6 6 6-6"/></Ico>;
export const IconChevronRight = (p: IconProps) => <Ico {...p}><path d="m9 6 6 6-6 6"/></Ico>;
export const IconEye = (p: IconProps) => <Ico {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></Ico>;
export const IconEdit = (p: IconProps) => <Ico {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></Ico>;
export const IconTrash = (p: IconProps) => <Ico {...p}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></Ico>;
export const IconReceipt = (p: IconProps) => <Ico {...p}><path d="M4 4v16l3-2 3 2 3-2 3 2 3-2V4z"/><path d="M8 8h8M8 12h8M8 16h5"/></Ico>;
export const IconDownload = (p: IconProps) => <Ico {...p}><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></Ico>;
export const IconUpload = (p: IconProps) => <Ico {...p}><path d="M12 17V5"/><path d="m7 10 5-5 5 5"/><path d="M5 21h14"/></Ico>;
export const IconCalendar = (p: IconProps) => <Ico {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></Ico>;
export const IconLogout = (p: IconProps) => <Ico {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></Ico>;
export const IconBolt = (p: IconProps) => <Ico {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/></Ico>;
export const IconDroplet = (p: IconProps) => <Ico {...p}><path d="M12 2.5s6 6.5 6 11.5a6 6 0 0 1-12 0c0-5 6-11.5 6-11.5z"/></Ico>;
export const IconSparkle = (p: IconProps) => <Ico {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M5.5 18.5l2.8-2.8M15.7 8.3l2.8-2.8"/></Ico>;
export const IconDots = (p: IconProps) => <Ico {...p}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></Ico>;
export const IconCheck = (p: IconProps) => <Ico {...p}><path d="m5 12 5 5L20 7"/></Ico>;
export const IconClock = (p: IconProps) => <Ico {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Ico>;
export const IconAlert = (p: IconProps) => <Ico {...p}><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></Ico>;
export const IconPrinter = (p: IconProps) => <Ico {...p}><path d="M6 9V2h12v7"/><rect x="6" y="14" width="12" height="8"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/></Ico>;
export const IconHome    = (p: IconProps) => <Ico {...p}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></Ico>;
export const IconMenu    = (p: IconProps) => <Ico {...p}><path d="M4 6h16M4 12h16M4 18h16"/></Ico>;
export const IconShield  = (p: IconProps) => <Ico {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Ico>;
export const IconLogIn   = (p: IconProps) => <Ico {...p}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/></Ico>;
export const IconSpeaker = (p: IconProps) => <Ico {...p}><path d="M3 11v2a8 8 0 0 0 8 8h0a8 8 0 0 0 8-8v-2"/><path d="M12 3v8"/><path d="M8 7l4-4 4 4"/></Ico>;
