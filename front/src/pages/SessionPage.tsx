import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { SetRow } from '../components/workout/SetRow';
import { Toast } from '../components/ui/Toast';
import { Confetti } from '../components/ui/Confetti';
import { API_URL } from '../lib/api';
import '../components/workout/Workout.css';

export const SessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { exercises, initFromWorkout, updateSet, addSet, removeSet, updateNotes, submitSession, isSubmitting } = useSession(id!);
  const [toast, setToast] = useState<{ message: string; icon: string; type?: 'success' | 'error' } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/workouts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        // Prendre la dernière session (la plus récente) pour pré-remplir
        const lastSession = data.sessions?.[data.sessions.length - 1];
        initFromWorkout(data.exercises, lastSession);
        setLoaded(true);
      } catch (err) {
        setToast({ message: 'Failed to load workout', icon: '❌', type: 'error' });
      }
    };
    if (id) load();
  }, [id, initFromWorkout]);

  const handleSubmit = async () => {
    const hasData = exercises.some(ex => ex.sets.some(s => s.weight > 0 && s.reps > 0));
    if (!hasData) {
      setToast({ message: 'Fill at least one set with weight and reps', icon: '⚠️', type: 'error' });
      return;
    }

    try {
      await submitSession();
      setShowConfetti(true);
      setToast({ message: 'Session saved!', icon: '✅', type: 'success' });
      setTimeout(() => navigate(`/my-workouts/${id}`), 2000);
    } catch {
      setToast({ message: 'Failed to save session', icon: '❌', type: 'error' });
    }
  };

  if (!loaded) {
    return (
      <div className="session-page">
        <div className="skeleton skeleton-header" style={{ height: 32, marginBottom: 16 }} />
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 120, marginBottom: 12, borderRadius: 14 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="session-page">
        <button className="back-btn" onClick={() => navigate(`/my-workouts/${id}`)}>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
  Back
</button>
      <h1 className="session-title">Log Session</h1>

      {exercises.map((ex, exIdx) => (
        <div key={ex.exerciseId} className="session-exercise">
          <h3 className="session-exercise-name">{ex.exerciseName}</h3>
          
          <div className="sets-container">
{ex.sets.map((set, setIdx) => (
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

          <input
            type="text"
            className="exercise-notes"
            placeholder="Notes for this exercise..."
            value={ex.notes}
            onChange={e => updateNotes(exIdx, e.target.value)}
          />
        </div>
      ))}

      <button className="finish-session-btn" onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Finish Workout'}
      </button>

      {toast && <Toast message={toast.message} icon={toast.icon} type={toast.type} onClose={() => setToast(null)} />}
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
    </div>
  );
};