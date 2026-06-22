import React from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import { WorkoutCard } from '../components/workout/WorkoutCard';
import '../components/workout/Workout.css';

export const MyWorkouts: React.FC = () => {
  const { workouts, isLoading, error } = useWorkouts();

  if (isLoading) {
    return (
      <div className="workouts-page">
        {/* Skeleton titre */}
        <div className="skeleton" style={{ height: 28, width: '50%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: '30%', marginBottom: 24 }} />

        {/* Skeleton cartes */}
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton" style={{
            height: 100,
            borderRadius: 14,
            marginBottom: 12
          }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="workouts-page">
        <p style={{ color: '#ef4444' }}>⚠️ {error}</p>
      </div>
    );
  }

  return (
    <div className="workouts-page">
      <h1 className="workouts-title">My Workouts</h1>
      <p className="workouts-subtitle">{workouts.length} workout{workouts.length !== 1 ? 's' : ''}</p>

      {workouts.map(w => (
        <WorkoutCard
          key={w.id}
          id={w.id}
          name={w.name}
          type={w.type}
          sessionsCount={w.sessions?.length || 0}
          volumes={w.sessions?.map((s: any) => s.totalVolume) || []}
        />
      ))}

      {workouts.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏋️</p>
          <p style={{ color: '#71717a', fontSize: '0.938rem', marginBottom: '0.5rem' }}>
            No workouts yet
          </p>
          <p style={{ color: '#52525b', fontSize: '0.813rem' }}>
            Create one from the Exercise Library
          </p>
        </div>
      )}
    </div>
  );
};