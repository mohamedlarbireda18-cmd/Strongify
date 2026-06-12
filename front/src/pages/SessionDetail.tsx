import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../lib/api';

interface SessionDetail {
  id: string;
  date: string;
  totalVolume: number;
  exercises: {
    exercise: { name: string };
    notes?: string;
    sets: {
      setNumber: number;
      weight: number;
      reps: number;
      isDropSet: boolean;
      isMicroReps: boolean;
      notes?: string;
    }[];
  }[];
}

export const SessionDetailPage: React.FC = () => {
  const { workoutId, sessionId } = useParams<{ workoutId: string; sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/workouts/${workoutId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const workout = await res.json();
        const found = workout.sessions.find((s: any) => s.id === sessionId);
        if (found) setSession(found);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSession();
  }, [workoutId, sessionId]);

  if (isLoading) return <div className="session-page"><p style={{ color: '#a1a1aa' }}>Loading...</p></div>;
  if (!session) return <div className="session-page"><p style={{ color: '#ef4444' }}>Session not found</p></div>;

  // Calculer les records par exercice (seulement le poids max)
  const exerciseRecords = session.exercises.map(ex => {
    const maxWeight = Math.max(...ex.sets.map(s => s.weight));
    return { maxWeight };
  });

  return (
    <div className="session-page">
      <button className="back-btn" onClick={() => navigate(`/my-workouts/${workoutId}`)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Back
      </button>

      <div className="session-summary">
        <div className="summary-item">
          <div className="summary-icon">📅</div>
          <div className="summary-info">
            <span className="summary-value">{new Date(session.date).toLocaleDateString()}</span>
            <span className="summary-label">Date</span>
          </div>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <div className="summary-icon">⚖️</div>
          <div className="summary-info">
            <span className="summary-value">{session.totalVolume} kg</span>
            <span className="summary-label">Total Volume</span>
          </div>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <div className="summary-icon">🏋️</div>
          <div className="summary-info">
            <span className="summary-value">{session.exercises.length}</span>
            <span className="summary-label">Exercises</span>
          </div>
        </div>
      </div>

      <h1 className="session-title">Session Details</h1>

      {session.exercises.map((ex, i) => (
        <div key={i} className="session-exercise">
          <h3 className="session-exercise-name">{ex.exercise.name}</h3>
          {ex.notes && (
            <p className="exercise-notes-display">
              <span className="note-icon">📝</span> {ex.notes}
            </p>
          )}
          <table className="session-table">
            <thead>
              <tr>
                <th>Set</th>
                <th>Weight</th>
                <th>Reps</th>
                <th>Drop</th>
                <th>Micro</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {ex.sets.map(set => {
                // Seule la série avec le poids le plus lourd est mise en évidence
                const isWeightRecord = set.weight === exerciseRecords[i].maxWeight && exerciseRecords[i].maxWeight > 0;

                return (
                  <tr key={set.setNumber} className={isWeightRecord ? 'set-record' : ''}>
                    <td>{set.setNumber}</td>
                    <td>{set.weight} kg</td>
                    <td>{set.reps}</td>
                    <td>{set.isDropSet ? <span className="badge badge-drop">✅</span> : ''}</td>
                    <td>{set.isMicroReps ? <span className="badge badge-micro">☑️</span> : ''}</td>
                    <td>{set.notes || ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};