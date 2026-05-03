import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/dashboard/chat': 'AI Legal Chat',
  '/dashboard/drafts': 'Legal Draft Generator',
  '/dashboard/strategy': 'Case Strategy',
  '/dashboard/api-keys': 'API Key Management',
  '/dashboard/billing': 'Billing & Plans',
  '/dashboard/settings': 'Settings',
  '/dashboard/admin': 'Admin Panel',
};

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'NyayaAI';

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="main-content">
        <TopNav title={title} onMenuClick={() => setMobileOpen(o => !o)} />

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
