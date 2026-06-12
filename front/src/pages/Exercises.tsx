import React, { useState, useMemo, useRef } from 'react';
import { useExercises } from '../hooks/useExercises';
import { useWorkoutBuilder } from '../hooks/useWorkoutBuilder';
import { ExerciseCard } from '../components/exercises/ExerciseCard';
import { ExerciseFilter } from '../components/exercises/ExerciseFilter';
import { CustomExerciseForm } from '../components/exercises/CustomExerciseForm';
import { WorkoutBuilderPanel } from '../components/exercises/WorkoutBuilderPanel';
import { Toast } from '../components/ui/Toast';
import '../components/exercises/Exercises.css';

export const Exercises: React.FC = () => {
  const { library, customExercises, isLoading, createCustom, updateCustom, deleteCustom } = useExercises();
  const {
    selectedExercises,
    addExercise,
    removeExercise,
    toggleExerciseType,
    clearSelection,
    createWorkout,
    isCreating
  } = useWorkoutBuilder();

  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [buildMode, setBuildMode] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [editingExercise, setEditingExercise] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; icon: string; type?: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [builderCollapsed, setBuilderCollapsed] = useState(true);
  const allExercises = useMemo(() => {
    let list = [...library, ...customExercises];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(ex => ex.name.toLowerCase().includes(s));
    }
    if (muscleFilter) list = list.filter(ex => ex.muscleGroup === muscleFilter);
    if (typeFilter) list = list.filter(ex => ex.type === typeFilter);
    if (sourceFilter === 'library') list = list.filter(ex => !('userId' in ex));
    else if (sourceFilter === 'custom') list = list.filter(ex => 'userId' in ex);
    return list;
  }, [library, customExercises, search, muscleFilter, typeFilter, sourceFilter]);

  const handleSelectExercise = (id: string, name: string, defaultType: string) => {
    if (selectedExercises.some(e => e.exerciseId === id)) {
      removeExercise(id);
    } else {
      addExercise(id, name, defaultType);
    }
  };

  const handleCreateWorkout = async (name: string, type: string) => {
    await createWorkout(name, type);
    setBuildMode(false);
    setToast({ message: `"${name}" created successfully!`, icon: '🏋️', type: 'success' });
  };

  const handleEditExercise = (id: string) => {
    const exercise = customExercises.find(e => e.id === id);
    if (exercise) {
      setEditingExercise(exercise);
      setShowForm(true);
    }
  };

  const handleDeleteExercise = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteCustom(deleteConfirm);
      setDeleteConfirm(null);
      setToast({ message: 'Exercise deleted', icon: '🗑️', type: 'error' });
    }
  };

  const handleSearchChange = (value: string) => {
    setIsFiltering(true);
    setSearch(value);
    setTimeout(() => setIsFiltering(false), 300);
  };

  const handleFormSubmit = async (name: string, muscle: string, type: string, imageUrl?: string) => {
    if (editingExercise) {
      await updateCustom(editingExercise.id, { name, muscleGroup: muscle, type, imageUrl });
      setToast({ message: 'Exercise updated', icon: '✏️', type: 'info' });
    } else {
      await createCustom(name, muscle, type, imageUrl);
      setToast({ message: 'Exercise created', icon: '✅', type: 'success' });
    }
    setEditingExercise(null);
  };

  if (isLoading) {
    return (
      <div className="exercises-page">
        <div className="exercises-header">
          <div className="skeleton skeleton-header" />
          <div className="skeleton skeleton-subtitle" />
        </div>
        <div className="exercise-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`exercises-page ${buildMode ? 'builder-visible' : ''} 
    ${!builderCollapsed ? 'builder-expanded' : ''}`}>
      {/* Header */}
      <div className="exercises-header">
        <h1 className="exercises-title">Exercise Library</h1>
        <p className="exercises-subtitle">Browse exercises and build your workouts</p>
      </div>

      {/* Build Workout Button */}
      <button
        className={`btn-build-workout ${buildMode ? 'active' : ''}`}
        onClick={() => {
          setBuildMode(!buildMode);
          if (buildMode) clearSelection();
        }}
      >
        {buildMode ? '✕ Cancel' : '🏋️ Build Workout'}
      </button>

      {/* Builder Instruction */}
      {buildMode && (
        <div className="builder-instruction">
          <span>👆</span>
          <span>Tap on exercises below to add them to your workout</span>
          {selectedExercises.length > 0 && (
            <span style={{ marginLeft: 'auto', fontWeight: 700 }}>
              {selectedExercises.length} selected
            </span>
          )}
        </div>
      )}

      {/* Filters */}
      <ExerciseFilter
        search={search}
        onSearchChange={handleSearchChange}
        muscleFilter={muscleFilter}
        onMuscleFilterChange={setMuscleFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        sourceFilter={sourceFilter}
        onSourceFilterChange={setSourceFilter}
      />

      {/* Results Count */}
      {search && (
        <div className="results-count">
          <span className="results-count-number">{allExercises.length}</span>
          <span>exercise{allExercises.length !== 1 ? 's' : ''} found</span>
        </div>
      )}

      {/* Exercise Grid */}
      <div className={`exercise-grid ${isFiltering ? 'filtering' : ''}`} ref={gridRef}>
        {allExercises.map(ex => (
          <ExerciseCard
            key={ex.id}
            id={ex.id}
            name={ex.name}
            muscleGroup={ex.muscleGroup}
            type={ex.type}
            isCustom={'userId' in ex}
            imageUrl={(ex as any).imageUrl}
            selectionMode={buildMode}
            isSelected={selectedExercises.some(s => s.exerciseId === ex.id)}
            onSelect={handleSelectExercise}
            onEdit={handleEditExercise}
            onDelete={handleDeleteExercise}
          />
        ))}
      </div>

      {/* Create Exercise Button */}
      {!buildMode && (
        <button className="create-exercise-btn" onClick={() => setShowForm(true)}>
          + Create Custom Exercise
        </button>
      )}

      {/* Workout Builder Panel */}
      {buildMode && (
  <WorkoutBuilderPanel
    exercises={selectedExercises}
    onToggleType={toggleExerciseType}
    onRemove={removeExercise}
    onCreate={handleCreateWorkout}
    isCreating={isCreating}
    onClear={clearSelection}
    collapsed={builderCollapsed}
    onToggleCollapse={() => setBuilderCollapsed(!builderCollapsed)}
  />
)}

      {/* Custom Exercise Form Modal */}
      {showForm && (
        <CustomExerciseForm
          onClose={() => {
            setShowForm(false);
            setEditingExercise(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingExercise}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Delete Exercise</h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Are you sure you want to delete this exercise?
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-save" style={{ background: '#ef4444' }} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          icon={toast.icon}
          type={toast.type || 'success'}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};