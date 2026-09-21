import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserDashboard } from './UserDashboard';
import { LMODashboard } from './LMODashboard';
import { GATCDashboard } from './GATCDashboard';
import { AdminDashboard } from './AdminDashboard';

export const DashboardRouter = () => {
  const { role } = useAuth();

  switch (role) {
    case 'SUPER_ADMIN':
      return <AdminDashboard />;
    case 'LMO':
      return <LMODashboard />;
    case 'GATC':
      return <GATCDashboard />;
    case 'USER':
    default:
      return <UserDashboard />;
  }
};
