import React, { useState } from 'react';
import { ImageCropModal } from './ImageCropModal';

interface CustomExerciseFormProps {
  onClose: () => void;
  onSubmit: (name: string, muscleGroup: string, type: string, imageUrl?: string) => void;
  initialData?: {
    id: string;
    name: string;
    muscleGroup: string;
    type: string;
    imageUrl?: string;
  } | null;
}

const muscleGroups = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Abs'
];

export const CustomExerciseForm: React.FC<CustomExerciseFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [muscle, setMuscle] = useState(initialData?.muscleGroup || muscleGroups[0]);
  const [type, setType] = useState(initialData?.type || 'BILATERAL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [image, setImage] = useState(initialData?.imageUrl || '');
  const [nameError, setNameError] = useState(false);

  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    setIsSubmitting(true);
    await onSubmit(name.trim(), muscle, type, image || undefined);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">{isEditing ? 'Edit Exercise' : 'Create Custom Exercise'}</h3>
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              className={`form-input ${nameError ? 'input-error' : ''}`}
              placeholder="Exercise name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(false);
              }}
              autoFocus
            />
            {nameError && <span className="error-message">Please enter an exercise name</span>}
          </div>

          {/* Muscle Group */}
          <div className="form-group">
            <label className="form-label">Muscle Group</label>
            <select
              className="form-select"
              value={muscle}
              onChange={e => setMuscle(e.target.value)}
            >
              {muscleGroups.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div className="form-group">
            <label className="form-label">Type</label>
            <div className="type-toggle-group">
              <button
                type="button"
                className={`type-toggle-btn ${type === 'BILATERAL' ? 'active' : ''}`}
                onClick={() => setType('BILATERAL')}
              >
                Bilateral
              </button>
              <button
                type="button"
                className={`type-toggle-btn ${type === 'UNILATERAL' ? 'active' : ''}`}
                onClick={() => setType('UNILATERAL')}
              >
                Unilateral
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="form-group">
            <label className="form-label">Image (optional)</label>
            {image ? (
              <div className="image-preview-wrapper">
                <div className="image-preview">
                  <img src={image} alt="Exercise preview" />
                </div>
                <button
                  type="button"
                  className="btn-change-image"
                  onClick={() => setShowCrop(true)}
                >
                  Change
                </button>
                <button
                  type="button"
                  className="btn-remove-image"
                  onClick={() => setImage('')}
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-upload-image"
                onClick={() => setShowCrop(true)}
              >
                + Add Image
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>

      {showCrop && (
        <ImageCropModal
          onClose={() => setShowCrop(false)}
          onSave={(croppedImage) => {
            setImage(croppedImage);
            setShowCrop(false);
          }}
        />
      )}
    </div>
  );
};