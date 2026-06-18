import React, { useState } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { StatsCards } from '../components/dashboard/StatsCards';
import { ProgressChart } from '../components/dashboard/ProgressChart';
import '../components/dashboard/Dashboard.css';
import { Loader } from '../components/ui/Loader';

const motivationalMessages = [
  { icon: '💪', text: 'Every rep brings you closer to your goals.' },
  { icon: '🔥', text: 'Consistency is the key to progress.' },
  { icon: '🎯', text: 'Focus on the process, results will follow.' },
  { icon: '⚡', text: 'Push yourself, no one else will do it for you.' },
  { icon: '🏆', text: 'Champions are made when no one is watching.' },
  { icon: '📈', text: 'Small daily improvements = big results.' },
  { icon: '🦾', text: 'Your only limit is your mind.' },
  { icon: '⏰', text: 'Time to grind. Make today count!' }
];

export const Dashboard: React.FC = () => {
  const {
    stats,
    workouts,
    selectedWorkout,
    progress,
    sessions,
    period,
    isLoading,
    error,
    changeSessions,
    changeWorkout,
    changePeriod
  } = useDashboard();

  // Message aléatoire choisi une seule fois au montage
  const [message] = useState(() => 
    motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
  );

if (isLoading) return <Loader text="Loading dashboard..." />;
  if (error) {
    return (
      <div className="dashboard-error">
        <span>⚠️</span>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="dashboard-greeting">Your Progress</h1>
        <p className="dashboard-subtitle">Track your fitness journey</p>
        <div className="dashboard-message">
          <span>{message.icon}</span>
          <span>{message.text}</span>
        </div>
      </div>

      {stats && (
        <StatsCards
          streak={stats.streak}
          currentWeight={stats.currentWeight}
          totalSessions={stats.totalSessions}
          period={period}
          onPeriodChange={changePeriod}
        />
      )}

      {workouts.length > 0 && (
        <div className="workout-selector">
          {workouts.map(w => (
            <button
              key={w.id}
              className={`workout-select-btn ${selectedWorkout === w.id ? 'active' : ''}`}
              onClick={() => changeWorkout(w.id)}
            >
              <span className="workout-select-type">{w.type}</span>
              <span className="workout-select-name">{w.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className={`progress-chart-wrapper ${stats ? 'visible' : ''}`}>
        <ProgressChart
          data={progress}
          sessions={sessions}
          onSessionsChange={changeSessions}
        />
      </div>
    </div>
  );
};