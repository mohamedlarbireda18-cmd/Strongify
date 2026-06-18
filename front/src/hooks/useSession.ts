import { useState, useCallback } from 'react';
import { API_URL } from '../lib/api';

interface SessionSet {
  tempId: string;
  setNumber: number;
  weight: number;
  reps: number;
  isDropSet: boolean;
  isMicroReps: boolean;
  notes: string;
}

interface SessionExercise {
  exerciseId: string;
  exerciseName: string;
  sets: SessionSet[];
  notes: string;
}

let idCounter = 0;
const generateId = () => `set_${Date.now()}_${idCounter++}_${Math.random().toString(36).substr(2, 5)}`;

export const useSession = (workoutId: string) => {
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem('token');

  const initFromWorkout = useCallback((workoutExercises: any[], lastSession?: any) => {
    const exs: SessionExercise[] = workoutExercises.map((we: any) => {
      const lastEx = lastSession?.exercises?.find((e: any) => e.exerciseId === we.exerciseId);
      const sets: SessionSet[] = lastEx
        ? lastEx.sets.map((s: any) => ({
            tempId: generateId(),
            setNumber: s.setNumber,
            weight: s.weight || 0,
            reps: s.reps || 0,
            isDropSet: s.isDropSet || false,
            isMicroReps: s.isMicroReps || false,
            notes: s.notes || ''
          }))
        : [{
            tempId: generateId(),
            setNumber: 1,
            weight: 0,
            reps: 0,
            isDropSet: false,
            isMicroReps: false,
            notes: ''
          }];

      return {
        exerciseId: we.exerciseId,
        exerciseName: we.exercise.name,
        sets,
        notes: lastEx?.notes || ''
      };
    });
    setExercises(exs);
  }, []);

  const updateSet = (exerciseIdx: number, setIdx: number, field: keyof SessionSet, value: any) => {
    setExercises(prev => {
      const updated = [...prev];
      const newSets = [...updated[exerciseIdx].sets];
      newSets[setIdx] = { ...newSets[setIdx], [field]: value };
      updated[exerciseIdx] = { ...updated[exerciseIdx], sets: newSets };
      return updated;
    });
  };

  const addSet = (exerciseIdx: number) => {
    setExercises(prev => {
      const updated = [...prev];
      const sets = [...updated[exerciseIdx].sets];
      sets.push({
        tempId: generateId(),
        setNumber: sets.length + 1,
        weight: 0,
        reps: 0,
        isDropSet: false,
        isMicroReps: false,
        notes: ''
      });
      updated[exerciseIdx] = { ...updated[exerciseIdx], sets };
      return updated;
    });
  };

  const removeSet = (exerciseIdx: number, tempId: string) => {
    setExercises(prev => {
      const updated = [...prev];
      const sets = updated[exerciseIdx].sets;
      if (sets.length <= 1) return prev;
      const filtered = sets.filter(s => s.tempId !== tempId);
      const reindexed = filtered.map((s, i) => ({ ...s, setNumber: i + 1 }));
      updated[exerciseIdx] = { ...updated[exerciseIdx], sets: reindexed };
      return updated;
    });
  };

  const updateNotes = (exerciseIdx: number, notes: string) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[exerciseIdx] = { ...updated[exerciseIdx], notes };
      return updated;
    });
  };

  const submitSession = async () => {
    setIsSubmitting(true);
    const res = await fetch(`${API_URL}/api/workouts/${workoutId}/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        exercises: exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          notes: ex.notes,
          sets: ex.sets.map(s => ({
            weight: s.weight,
            reps: s.reps,
            isDropSet: s.isDropSet,
            isMicroReps: s.isMicroReps,
            notes: s.notes
          }))
        }))
      })
    });
    setIsSubmitting(false);
    if (!res.ok) throw new Error('Failed to save session');
    return res.json();
  };

  return { exercises, initFromWorkout, updateSet, addSet, removeSet, updateNotes, submitSession, isSubmitting };
};