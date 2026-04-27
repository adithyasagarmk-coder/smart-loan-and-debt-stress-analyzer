import React, { createContext, useContext, useState, useCallback } from 'react';
import { dashboardService } from '../services/api';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await dashboardService.getData();
      if (response.data && response.data.data) {
        setDashboardData(response.data.data);
      }
      return response.data;
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      return null;
    }
  }, []);

  return (
    <DashboardContext.Provider value={{ dashboardData, setDashboardData, fetchDashboardData }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};
