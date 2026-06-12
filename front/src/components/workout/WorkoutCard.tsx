import React from 'react';
import { useNavigate } from 'react-router-dom';

interface WorkoutCardProps {
  id: string;
  name: string;
  type: string;
  sessionsCount: number;
  volumes?: number[];
  onDelete?: (id: string) => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ id, name, type, sessionsCount, volumes = [], onDelete }) => {
  const navigate = useNavigate();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(id);
  };

  // Éviter la division par zéro et garantir une hauteur visible
  const safeMax = Math.max(...volumes, 1);

  return (
    <div className={`workout-card type-${type}`} onClick={() => navigate(`/my-workouts/${id}`)}>
      <button className="workout-delete-btn" onClick={handleDelete} title="Delete workout">
        🗑️
      </button>
      <div className="workout-card-header">
        <span className="workout-card-type">{type.replace('_', ' ')}</span>
        <span className="workout-card-sessions">{sessionsCount} session{sessionsCount !== 1 ? 's' : ''}</span>
      </div>
      <h3 className="workout-card-name">{name}</h3>
      {volumes.length > 0 && (
        <div className="workout-card-sparkline">
          {volumes.map((v, i) => (
            <div
              key={i}
              className="sparkline-bar"
              style={{ height: `${Math.max(4, (v / safeMax) * 100)}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};