import React from 'react';

interface SetRowProps {
  tempId: string;
  setNumber: number;
  weight: number;
  reps: number;
  isDropSet: boolean;
  isMicroReps: boolean;
  notes: string;
  onUpdate: (field: string, value: any) => void;
  onRemove: (tempId: string) => void;
  canRemove: boolean;
}

export const SetRow: React.FC<SetRowProps> = ({
  tempId,
  setNumber,
  weight,
  reps,
  isDropSet,
  isMicroReps,
  notes,
  onUpdate,
  onRemove,
  canRemove
}) => {
  return (
    <div className="set-row">
      <span className="set-number">{setNumber}</span>
      <input
        type="number"
        className="set-input"
        placeholder="kg"
        value={weight || ''}
        onChange={e => onUpdate('weight', Number(e.target.value))}
      />
      <input
        type="number"
        className="set-input"
        placeholder="reps"
        value={reps || ''}
        onChange={e => onUpdate('reps', Number(e.target.value))}
      />
      <div className="set-toggles">
        <button
          className={`set-toggle ${isDropSet ? 'active' : ''}`}
          onClick={() => onUpdate('isDropSet', !isDropSet)}
        >
          Drop
        </button>
        <button
          className={`set-toggle ${isMicroReps ? 'active' : ''}`}
          onClick={() => onUpdate('isMicroReps', !isMicroReps)}
        >
          Micro
        </button>
      </div>
      {canRemove && (
        <button className="set-remove" onClick={() => onRemove(tempId)}>×</button>
      )}
    </div>
  );
};