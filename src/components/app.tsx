'use client';

import { useState, useEffect } from 'react';
import { ToastHost } from './ui';
import { Sidebar, MobileBar, MobileMenu, type RouteId, type SidebarCounts } from './sidebar';
import { DashboardPage } from './pages/dashboard';
import { StudentsPage } from './pages/students';
import { RoomsPage } from './pages/rooms';
import { FeesPage } from './pages/fees';
import { ComplaintsPage } from './pages/complaints';
import { VisitorsPage } from './pages/visitors';
import { NoticesPage } from './pages/notices';
import { UsersPage } from './pages/users';
import { getDashboard } from '@/lib/api';

export default function App() {
  const [route,      setRoute]      = useState<RouteId>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [counts,     setCounts]     = useState<SidebarCounts>({});

  const [studentTrigger,   setStudentTrigger]   = useState(0);
  const [feeTrigger,       setFeeTrigger]       = useState(0);
  const [complaintTrigger, setComplaintTrigger] = useState(0);

  const refreshCounts = () => {
    getDashboard().then((res) => {
      if (!res.data) return;
      const s = res.data.stats;
      const occ = s.totalCapacity > 0 ? Math.round((s.occupiedBeds / s.totalCapacity) * 100) : 0;
      setCounts({
        students:   s.totalStudents,
        complaints: s.openComplaints,
        fees:       s.pendingFees,
        visitors:   s.visitorsInside,
        notices:    s.activeNotices,
        occupancy:  occ,
      });
    }).catch(() => {});
  };

  useEffect(() => { refreshCounts(); }, []);

  const quickAdd = () => {
    setRoute('students');
    setStudentTrigger((n) => n + 1);
  };
  const quickPay = () => {
    setRoute('fees');
    setFeeTrigger((n) => n + 1);
  };
  const quickComplaint = () => {
    setRoute('complaints');
    setComplaintTrigger((n) => n + 1);
  };

  return (
    <ToastHost>
      <div className="min-h-screen flex bg-[#F7F8FA]">
        <Sidebar current={route} onNav={setRoute} counts={counts} />
        <div className="flex-1 min-w-0 flex flex-col">
          <MobileBar onOpenMenu={() => setMobileOpen(true)} />
          <MobileMenu
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            current={route}
            onNav={setRoute}
          />
          <main className="flex-1 px-5 md:px-8 py-6 md:py-8 max-w-[1400px] w-full mx-auto">
            {route === 'dashboard' && (
              <DashboardPage
                onNav={setRoute}
                onAddStudent={quickAdd}
                onRecordPayment={quickPay}
                onAddComplaint={quickComplaint}
              />
            )}
            {route === 'students'   && <StudentsPage   openTrigger={studentTrigger}   onClearTrigger={() => setStudentTrigger(0)}   onCountChange={refreshCounts} />}
            {route === 'rooms'      && <RoomsPage      onCountChange={refreshCounts} />}
            {route === 'fees'       && <FeesPage       openTrigger={feeTrigger}       onClearTrigger={() => setFeeTrigger(0)}       onCountChange={refreshCounts} />}
            {route === 'complaints' && <ComplaintsPage openTrigger={complaintTrigger} onClearTrigger={() => setComplaintTrigger(0)} onCountChange={refreshCounts} />}
            {route === 'visitors'   && <VisitorsPage   onCountChange={refreshCounts} />}
            {route === 'notices'    && <NoticesPage    onCountChange={refreshCounts} />}
            {route === 'users'      && <UsersPage />}
          </main>
        </div>
      </div>
    </ToastHost>
  );
}
