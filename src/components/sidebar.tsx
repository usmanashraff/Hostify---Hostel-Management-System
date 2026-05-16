'use client';

import { useSession, signOut } from 'next-auth/react';
import { Avatar } from './ui';
import {
  IconDashboard, IconUsers, IconBed, IconWallet, IconWrench,
  IconHome, IconLogout, IconMenu, IconBell, IconLogIn, IconShield,
  type IconProps,
} from './icons';
import { avatarHue } from '@/lib/utils';

export type RouteId = 'dashboard' | 'students' | 'rooms' | 'fees' | 'complaints' | 'visitors' | 'notices' | 'users';

interface NavItem { id: RouteId; label: string; icon: React.ComponentType<IconProps>; }
const NAV: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard',      icon: IconDashboard },
  { id: 'students',   label: 'Students',        icon: IconUsers },
  { id: 'rooms',      label: 'Rooms & Beds',    icon: IconBed },
  { id: 'fees',       label: 'Fee Management',  icon: IconWallet },
  { id: 'complaints', label: 'Complaints',      icon: IconWrench },
  { id: 'visitors',   label: 'Visitors Log',    icon: IconLogIn },
  { id: 'notices',    label: 'Notices',         icon: IconBell },
  { id: 'users',      label: 'Staff & Users',   icon: IconShield },
];

export interface SidebarCounts {
  students?:   number;
  complaints?: number;
  fees?:       number;
  visitors?:   number;
  notices?:    number;
  occupancy?:  number;
}

interface SidebarProps { current: RouteId; onNav: (id: RouteId) => void; counts: SidebarCounts; }

export const Sidebar = ({ current, onNav, counts }: SidebarProps) => {
  const { data: session } = useSession();
  const userName  = session?.user?.name  ?? 'Admin User';
  const userEmail = session?.user?.email ?? 'admin@hostelite.pk';
  const hue       = avatarHue(userName);

  return (
    <aside className="hidden md:flex w-[240px] shrink-0 h-screen sticky top-0 flex-col bg-white border-r border-slate-200">
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-sm">
            <IconHome size={18} stroke={2} />
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold text-slate-900">Hostelite</div>
            <div className="text-[11px] text-slate-500">Boys Hostel · Block A</div>
          </div>
        </div>
      </div>

      <nav className="px-3 flex-1 overflow-y-auto nice-scroll">
        <div className="px-2 mb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Menu</div>
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const Icon   = item.icon;
            const active = current === item.id;
            const count  = counts[item.id as keyof SidebarCounts];
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onNav(item.id)}
                  className={`group relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition
                    ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-brand-600" />}
                  <Icon size={18} stroke={active ? 2 : 1.75} className={active ? 'text-brand-600' : 'text-slate-500 group-hover:text-slate-700'} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {typeof count === 'number' && count > 0 && (
                    <span className={`text-[11px] rounded-full px-1.5 py-0.5 font-semibold ${active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="px-2 mt-6 mb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Quick stats</div>
        <div className="mx-2 mb-4 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-slate-500">Occupancy</span>
            <span className="font-semibold text-slate-900">{counts?.occupancy ?? '—'}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-brand-600 transition-all" style={{ width: `${counts?.occupancy ?? 0}%` }} />
          </div>
        </div>
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-slate-50 cursor-pointer transition group">
          <Avatar name={userName} hue={hue} size={36} />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-slate-900 truncate">{userName}</div>
            <div className="text-[11px] text-slate-500 truncate">{userEmail}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="opacity-0 group-hover:opacity-100 transition"
            title="Sign out"
          >
            <IconLogout size={16} className="text-slate-400 hover:text-rose-600 transition" />
          </button>
        </div>
      </div>
    </aside>
  );
};

interface MobileBarProps { onOpenMenu: () => void; }
export const MobileBar = ({ onOpenMenu }: MobileBarProps) => {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? 'Admin';
  const hue      = avatarHue(userName);
  return (
    <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button onClick={onOpenMenu} className="h-9 w-9 rounded-md hover:bg-slate-100 flex items-center justify-center">
          <IconMenu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-brand-600 text-white flex items-center justify-center">
            <IconHome size={16} stroke={2} />
          </div>
          <span className="font-semibold text-slate-900 text-sm">Hostelite</span>
        </div>
      </div>
      <Avatar name={userName} hue={hue} size={32} />
    </div>
  );
};

interface MobileMenuProps { open: boolean; onClose: () => void; current: RouteId; onNav: (id: RouteId) => void; }
export const MobileMenu = ({ open, onClose, current, onNav }: MobileMenuProps) => {
  if (!open) return null;
  return (
    <div className="md:hidden fixed inset-0 z-50 fade-in">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-72 bg-white slide-in-right">
        <Sidebar current={current} onNav={(id) => { onNav(id); onClose(); }} counts={{}} />
      </div>
    </div>
  );
};
