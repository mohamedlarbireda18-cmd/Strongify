import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { BottomTabBar } from './BottomTabBar';
import { Loader } from '../ui/Loader';
import './Layout.css';
import '../ui/Loader.css';

export const AppLayout: React.FC = () => {
  return (
    <div className="app-layout">
      <AppHeader />
      <main className="app-content">
        <Suspense fallback={<Loader text="Loading page..." />}>
          <Outlet />
        </Suspense>
      </main>
      <BottomTabBar />
    </div>
  );
};