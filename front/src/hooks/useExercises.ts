import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../lib/api';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  type: string;
  description?: string;
  imageUrl?: string;
}

interface CustomExercise extends Exercise {
  userId: string;
}

export const useExercises = () => {
  const [library, setLibrary] = useState<Exercise[]>([]);
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const fetchExercises = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/exercises`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch exercises');
      const data = await res.json();
      setLibrary(data.library || []);
      setCustomExercises(data.custom || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const createCustom = async (name: string, muscleGroup: string, type: string, imageUrl?: string) => {
    const res = await fetch(`${API_URL}/api/exercises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, muscleGroup, type, imageUrl })
    });
    if (!res.ok) throw new Error('Failed to create exercise');
    await fetchExercises();
  };

  const updateCustom = async (id: string, data: { name?: string; muscleGroup?: string; type?: string; imageUrl?: string }) => {
    const res = await fetch(`${API_URL}/api/exercises/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update exercise');
    await fetchExercises();
  };

  const deleteCustom = async (id: string) => {
    const res = await fetch(`${API_URL}/api/exercises/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete exercise');
    await fetchExercises();
  };

  return {
    library,
    customExercises,
    allExercises: [...library, ...customExercises],
    isLoading,
    error,
    createCustom,
    updateCustom,
    deleteCustom,
    refetch: fetchExercises
  };
};