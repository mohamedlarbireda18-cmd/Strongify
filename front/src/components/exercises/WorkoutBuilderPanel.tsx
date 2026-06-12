import React, { useState } from 'react';

interface SelectedExercise {
  exerciseId: string;
  name: string;
  type: string;
}

interface Props {
  exercises: SelectedExercise[];
  onToggleType: (id: string) => void;
  onRemove: (id: string) => void;
  onCreate: (name: string, type: string) => Promise<void>;
  isCreating: boolean;
  onClear: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const workoutTypes = ['PUSH', 'PULL', 'LEGS', 'FULL_BODY', 'UPPER', 'LOWER', 'CUSTOM'];

export const WorkoutBuilderPanel: React.FC<Props> = ({
  exercises,
  onToggleType,
  onRemove,
  onCreate,
  isCreating,
  onClear,
  collapsed,
  onToggleCollapse,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('PUSH');
  const [nameError, setNameError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    if (exercises.length === 0) return;

    setNameError(false);
    await onCreate(name.trim(), type);
    setName('');
    setType('PUSH');
  };

  if (exercises.length === 0) return null;

  return (
    <div className={`builder-panel ${collapsed ? 'collapsed' : ''}`}>
      {/* Header toujours visible */}
      <div className="builder-panel-header" onClick={onToggleCollapse}>
        <h3>Workout Builder ({exercises.length} exercises)</h3>
        <button className="builder-collapse-btn">
          {collapsed ? '▲' : '▼'}
        </button>
      </div>

      {/* Contenu affiché seulement si déplié */}
      {!collapsed && (
        <div className="builder-content">
          <div className="builder-actions-top">
            <button onClick={onClear} className="btn-clear">Clear All</button>
          </div>

          <ul className="builder-exercise-list">
            {exercises.map((ex, index) => (
              <li key={ex.exerciseId} className="builder-exercise-item">
                <span className="builder-exercise-number">{index + 1}</span>
                <span className="builder-exercise-name">{ex.name}</span>
                <button
                  className={`builder-type-toggle ${ex.type === 'UNILATERAL' ? 'unilateral' : ''}`}
                  onClick={() => onToggleType(ex.exerciseId)}
                >
                  {ex.type === 'BILATERAL' ? 'Bilateral' : 'Unilateral'}
                </button>
                <button className="builder-remove-btn" onClick={() => onRemove(ex.exerciseId)}>×</button>
              </li>
            ))}
          </ul>

          <form onSubmit={handleSubmit} className="builder-form">
            <input
              type="text"
              placeholder="Workout name (e.g. Push A)"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(false);
              }}
              className={`builder-name-input ${nameError ? 'input-error' : ''}`}
            />
            {nameError && <span className="error-message">⚠️ Please enter a workout name</span>}

            <select value={type} onChange={e => setType(e.target.value)} className="builder-type-select">
              {workoutTypes.map(t => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>

            <button type="submit" className="btn-save-builder" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Workout'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};