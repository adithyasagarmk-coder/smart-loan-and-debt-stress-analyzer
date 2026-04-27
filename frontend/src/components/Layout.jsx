import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AiAssistant from './AiAssistant';
import { useDashboard } from '../context/DashboardContext';

const Layout = () => {
  const { dashboardData, fetchDashboardData } = useDashboard();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 30%, #f0fdf4 70%, #ecfdf5 100%)' }}>
      <Sidebar />
      <main className="sidebar-offset" style={{ minHeight: '100vh', padding: '32px 28px' }}>
        <Outlet />
      </main>
      
      {/* Global AI Assistant across all pages */}
      <AiAssistant 
        monthlyIncome={dashboardData?.monthlyIncome || 0}
        monthlyExpenses={dashboardData?.monthlyExpenses || 0}
        totalEMI={dashboardData?.totalEMI || 0}
        stressScore={dashboardData?.stressScore || 0}
        loans={dashboardData?.recentLoans || []}
      />
    </div>
  );
};

export default Layout;
