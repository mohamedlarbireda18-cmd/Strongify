import React, { useState } from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import { WorkoutCard } from '../components/workout/WorkoutCard';
import { Toast } from '../components/ui/Toast';
import '../components/workout/Workout.css';

export const MyWorkouts: React.FC = () => {
  const { workouts, isLoading, error, deleteWorkout } = useWorkouts();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; icon: string; type?: 'success' | 'error' } | null>(null);

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteWorkout || !deleteConfirm) return;
    try {
      await deleteWorkout(deleteConfirm);
      setToast({ message: 'Workout deleted', icon: '🗑️', type: 'error' });
    } catch {
      setToast({ message: 'Failed to delete', icon: '❌', type: 'error' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (isLoading) return <div className="workouts-page">Loading...</div>;
  if (error) return <div className="workouts-page">⚠️ {error}</div>;

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
          volumes={w.sessions?.map(s => s.totalVolume) || []}
          onDelete={handleDelete}
        />
      ))}
      {workouts.length === 0 && (
        <p className="text-muted">No workouts yet. Create one from the Exercise Library.</p>
      )}

      {/* Modale de confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Delete Workout</h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Are you sure you want to delete this workout? All sessions will be lost.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-save" style={{ background: '#ef4444' }} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} icon={toast.icon} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};