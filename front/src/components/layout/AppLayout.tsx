import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { BottomTabBar } from './BottomTabBar';
import './Layout.css';

export const AppLayout: React.FC = () => {
  return (
    <div className="app-layout">
      <AppHeader />
      <main className="app-content">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  );
};