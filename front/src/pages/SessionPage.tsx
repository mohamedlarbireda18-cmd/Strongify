import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { SetRow } from '../components/workout/SetRow';
import { Toast } from '../components/ui/Toast';
import { Confetti } from '../components/ui/Confetti';
import { API_URL } from '../lib/api';
import '../components/workout/Workout.css';

export const SessionPage: React.FC = () => {
  const { id, sessionId } = useParams<{ id: string; sessionId?: string }>();
  const navigate = useNavigate();
  const { exercises, initFromWorkout, updateSet, addSet, removeSet, updateNotes, submitSession, isSubmitting } = useSession(id!);
  const [toast, setToast] = useState<{ message: string; icon: string; type?: 'success' | 'error' } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const isEditMode = !!sessionId;

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/workouts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (isEditMode && sessionId) {
          const session = data.sessions?.find((s: any) => s.id === sessionId);
          if (session) {
            initFromWorkout(data.exercises, session);
          }
        } else {
          const lastSession = data.sessions?.[data.sessions.length - 1];
          initFromWorkout(data.exercises, lastSession);
        }
        setLoaded(true);
      } catch (err) {
        setToast({ message: 'Failed to load workout', icon: '❌', type: 'error' });
      }
    };
    if (id) load();
  }, [id, isEditMode, sessionId, initFromWorkout]);

  useEffect(() => {
    const hasData = exercises.some((ex: any) => ex.sets.some((s: any) => s.weight > 0 || s.reps > 0));
    setHasUnsavedChanges(hasData);
  }, [exercises]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    window.history.pushState(null, '', window.location.pathname);
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.pathname);
      setShowExitModal(true);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [hasUnsavedChanges]);

  const handleSubmit = async () => {
    const hasData = exercises.some((ex: any) => ex.sets.some((s: any) => s.weight > 0 && s.reps > 0));
    if (!hasData) {
      setToast({ message: 'Fill at least one set with weight and reps', icon: '⚠️', type: 'error' });
      return;
    }

    try {
      if (isEditMode && sessionId) {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/workouts/session/${sessionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            exercises: exercises.map((ex: any) => ({
              exerciseId: ex.exerciseId,
              notes: ex.notes,
              sets: ex.sets.map((s: any) => ({
                weight: s.weight,
                reps: s.reps,
                isDropSet: s.isDropSet,
                isMicroReps: s.isMicroReps,
                notes: s.notes
              }))
            }))
          })
        });
        if (!res.ok) throw new Error('Failed to update session');
        setToast({ message: 'Session updated!', icon: '✅', type: 'success' });
      } else {
        await submitSession();
        setToast({ message: 'Session saved!', icon: '✅', type: 'success' });
      }
      setHasUnsavedChanges(false);
      setShowConfetti(true);
      setTimeout(() => navigate(`/my-workouts/${id}`), 2000);
    } catch {
      setToast({ message: 'Failed to save session', icon: '❌', type: 'error' });
    }
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowExitModal(true);
    } else {
      navigate(`/my-workouts/${id}`);
    }
  };

  if (!loaded) {
    return (
      <div className="session-page">
        <div className="skeleton" style={{ height: 32, marginBottom: 16 }} />
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 120, marginBottom: 12, borderRadius: 14 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="session-page">
      <button className="back-btn" onClick={handleBackClick}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Back
      </button>
      <h1 className="session-title">{isEditMode ? 'Edit Session' : 'Log Session'}</h1>

      {exercises.map((ex: any, exIdx: number) => (
        <div key={ex.exerciseId} className="session-exercise">
          <h3 className="session-exercise-name">{ex.exerciseName}</h3>
          <div className="sets-container">
            {ex.sets.map((set: any, setIdx: number) => (
              <SetRow
                key={set.tempId}
                tempId={set.tempId}
                setNumber={set.setNumber}
                weight={set.weight}
                reps={set.reps}
                isDropSet={set.isDropSet}
                isMicroReps={set.isMicroReps}
                notes={set.notes}
                onUpdate={(field, value) => updateSet(exIdx, setIdx, field as any, value)}
                onRemove={(tempId) => removeSet(exIdx, tempId)}
                canRemove={ex.sets.length > 1}
              />
            ))}
          </div>
          <button className="add-set-btn" onClick={() => addSet(exIdx)}>+ Add Set</button>
          <input type="text" className="exercise-notes" placeholder="Notes for this exercise..." value={ex.notes} onChange={e => updateNotes(exIdx, e.target.value)} />
        </div>
      ))}

      <button className="finish-session-btn" onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : isEditMode ? 'Update Session' : 'Finish Workout'}
      </button>

      {showExitModal && (
        <div className="modal-overlay" onClick={() => setShowExitModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Unsaved Changes</h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              You have unsaved data in this session. Are you sure you want to leave? Your progress will be lost.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowExitModal(false)}>Stay</button>
              <button className="btn-save" style={{ background: '#ef4444' }} onClick={() => { setShowExitModal(false); navigate(`/my-workouts/${id}`); }}>Leave</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} icon={toast.icon} type={toast.type} onClose={() => setToast(null)} />}
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
    </div>
  );
};