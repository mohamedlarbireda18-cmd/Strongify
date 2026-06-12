import { useState, useEffect } from 'react';
import { API_URL } from '../lib/api';

interface WorkoutDetail {
  id: string;
  name: string;
  type: string;
  exercises: {
    exerciseId: string;
    exercise: { id: string; name: string; muscleGroup: string; type: string; imageUrl?: string };
    order: number;
  }[];
  sessions: {
    id: string;
    date: string;
    totalVolume: number;
    exercises: {
      exerciseId: string;
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
  }[];
}

interface ExerciseProgress {
  name: string;
  data: { date: string; volume: number; maxWeight: number }[];
}

export const useWorkoutDetail = (workoutId: string) => {
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [progress, setProgress] = useState<ExerciseProgress[]>([]);
  const [progressSessions, setProgressSessions] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchWorkout = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/workouts/${workoutId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch workout');
        const data = await res.json();
        setWorkout(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (workoutId) fetchWorkout();
  }, [workoutId, token]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/workouts/${workoutId}/progress?sessions=${progressSessions}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('Failed to fetch progress');
        const data = await res.json();
        setProgress(data);
      } catch (err: any) {
        console.error(err);
      }
    };

    if (workoutId) fetchProgress();
  }, [workoutId, progressSessions, token]);

  return { workout, progress, progressSessions, setProgressSessions, isLoading, error };
};