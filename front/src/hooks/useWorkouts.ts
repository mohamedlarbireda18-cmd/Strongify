import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../lib/api';

interface Workout {
  id: string;
  name: string;
  type: string;
  exercises: {
    exerciseId: string;
    exercise: { id: string; name: string; muscleGroup: string; type: string };
    order: number;
  }[];
  sessions: {
    id: string;
    date: string;
    totalVolume: number;
    exercises: {
      exerciseId: string;
      sets: { setNumber: number; weight: number; reps: number }[];
    }[];
  }[];
}

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const fetchWorkouts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/workouts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch workouts');
      const data = await res.json();
      setWorkouts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const deleteWorkout = async (id: string) => {
    const res = await fetch(`${API_URL}/api/workouts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete workout');
    await fetchWorkouts();
  };

  return { workouts, isLoading, error, refetch: fetchWorkouts, deleteWorkout };
};