import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/exercises', label: 'Exercises', icon: '📚' },
  { path: '/my-workouts', label: 'Workouts', icon: '🏋️' },
  { path: '/body', label: 'Body', icon: '⚖️' },
  { path: '/profile', label: 'Profile', icon: '👤' }
];

export const BottomTabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-tab-bar">
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            className={`tab-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};