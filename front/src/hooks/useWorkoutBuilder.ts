import { useState } from 'react';
import { API_URL } from '../lib/api';

interface SelectedExercise {
  exerciseId: string;
  name: string;
  type: string; // BILATERAL or UNILATERAL
  order: number;
}

export const useWorkoutBuilder = () => {
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const addExercise = (exerciseId: string, name: string, defaultType: string) => {
    if (selectedExercises.some(e => e.exerciseId === exerciseId)) return;
    setSelectedExercises(prev => [
      ...prev,
      { exerciseId, name, type: defaultType, order: prev.length + 1 }
    ]);
  };

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises(prev => prev.filter(e => e.exerciseId !== exerciseId));
  };

  const toggleExerciseType = (exerciseId: string) => {
    setSelectedExercises(prev =>
      prev.map(e =>
        e.exerciseId === exerciseId
          ? { ...e, type: e.type === 'BILATERAL' ? 'UNILATERAL' : 'BILATERAL' }
          : e
      )
    );
  };

  const clearSelection = () => setSelectedExercises([]);

  const createWorkout = async (name: string, type: string) => {
    setIsCreating(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/workouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        type,
        exercises: selectedExercises.map(e => ({
          exerciseId: e.exerciseId,
          order: e.order
        }))
      })
    });
    setIsCreating(false);
    if (!res.ok) throw new Error('Failed to create workout');
    clearSelection();
    return res.json();
  };

  return {
    selectedExercises,
    addExercise,
    removeExercise,
    toggleExerciseType,
    clearSelection,
    createWorkout,
    isCreating
  };
};