import { createContext, useContext, useMemo } from 'react';
import { createDashboardRefreshNotifier } from './dashboardRefreshNotifier.js';

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const notifier = useMemo(() => createDashboardRefreshNotifier(), []);

  const value = useMemo(
    () => ({
      refreshStats: () => notifier.refreshStats(),
      subscribeToRefresh: notifier.subscribe,
    }),
    [notifier]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardRefresh() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error('useDashboardRefresh must be used within DashboardProvider');
  }
  return ctx;
}
