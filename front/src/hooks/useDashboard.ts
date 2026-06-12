import { useState, useEffect } from 'react';
import { API_URL } from '../lib/api';

interface DashboardStats {
  streak: number;
  currentWeight: number | null;
  totalSessions: number;
}

interface WorkoutSummary {
  id: string;
  name: string;
  type: string;
  sessionsCount: number;
}

interface ProgressPoint {
  date: string;
  volume: number;
  maxWeight: number;
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressPoint[]>([]);
  const [sessions, setSessions] = useState(5);
  const [period, setPeriod] = useState('month'); // 'week', '15days', 'month'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  // Récupérer les stats + la liste des workouts
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [statsRes, workoutsRes] = await Promise.all([
          fetch(`${API_URL}/api/dashboard/stats?period=${period}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/workouts`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (!statsRes.ok || !workoutsRes.ok) throw new Error('Failed to fetch');

        const statsData = await statsRes.json();
        const workoutsData = await workoutsRes.json();

        setStats(statsData);

        const summaries = workoutsData.map((w: any) => ({
          id: w.id,
          name: w.name,
          type: w.type,
          sessionsCount: w.sessions?.length || 0
        }));
        setWorkouts(summaries);

        if (summaries.length > 0 && !selectedWorkout) {
          setSelectedWorkout(summaries[0].id);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [token, period, selectedWorkout]);

  // Récupérer la progression du workout sélectionné
  useEffect(() => {
    if (!selectedWorkout) return;

    const fetchProgress = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/workouts/${selectedWorkout}/progress?sessions=${sessions}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('Failed to fetch progress');
        const data = await res.json();

        const sessionVolumes: ProgressPoint[] = [];

        data.forEach((exercise: any) => {
          exercise.data.forEach((point: any, index: number) => {
            if (!sessionVolumes[index]) {
              sessionVolumes[index] = { date: point.date, volume: 0, maxWeight: 0 };
            }
            sessionVolumes[index].volume += point.volume;
            sessionVolumes[index].maxWeight = Math.max(sessionVolumes[index].maxWeight, point.maxWeight);
          });
        });

        setProgress(sessionVolumes);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchProgress();
  }, [selectedWorkout, sessions, token]);

  const changeSessions = (nb: number) => setSessions(nb);
  const changeWorkout = (id: string) => setSelectedWorkout(id);
  const changePeriod = (newPeriod: string) => setPeriod(newPeriod);

  return {
    stats,
    workouts,
    selectedWorkout,
    progress,
    sessions,
    period,
    isLoading,
    error,
    changeSessions,
    changeWorkout,
    changePeriod
  };
};