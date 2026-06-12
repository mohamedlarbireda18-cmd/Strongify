import React, { useState } from 'react';

interface ExerciseCardProps {
  id: string;
  name: string;
  muscleGroup: string;
  type: string;
  isCustom?: boolean;
  imageUrl?: string;
  onSelect?: (id: string, name: string, defaultType: string) => void;
  isSelected?: boolean;
  selectionMode?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  id,
  name,
  muscleGroup,
  type,
  isCustom,
  imageUrl,
  onSelect,
  isSelected,
  selectionMode,
  onEdit,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={`exercise-card visible ${isSelected ? 'selected' : ''} ${selectionMode ? 'selection-mode' : ''}`}
      data-muscle={muscleGroup}
      onClick={() => {
        if (selectionMode && onSelect) {
          onSelect(id, name, type);
        }
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Actions Edit/Delete pour exercices custom */}
      {isCustom && !selectionMode && (
        <div className={`exercise-card-actions ${showActions ? 'visible' : ''}`}>
          <button
            className="exercise-action-btn edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(id);
            }}
            title="Edit exercise"
          >
            ✏️
          </button>
          <button
            className="exercise-action-btn delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(id);
            }}
            title="Delete exercise"
          >
            🗑️
          </button>
        </div>
      )}

      {isCustom && <span className="exercise-card-custom">CUSTOM</span>}
      {isSelected && <div className="selected-check">✓</div>}

      <div className="exercise-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={name} />
        ) : (
          <span className="exercise-placeholder">🏋️</span>
        )}
      </div>

      <span className="exercise-card-name">{name}</span>
      <span className="exercise-card-muscle">{muscleGroup}</span>
      <span className="exercise-card-type">{type}</span>
    </div>
  );
};