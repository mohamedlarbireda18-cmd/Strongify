import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../lib/api';

interface WeightLog { id: string; weight: number; date: string; }
interface CalorieLog { id: string; calories: number; date: string; }
interface UserGoals { goal: string; activity: string; height: number | null; age: number | null; gender: string | null; targetWeight: number | null; }
interface BMRResult { bmr: number; maintenance: number; cutting: number; bulking: number; }

export const useBody = () => {
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [calorieLogs, setCalorieLogs] = useState<CalorieLog[]>([]);
  const [allCalorieLogs, setAllCalorieLogs] = useState<CalorieLog[]>([]);
  const [userGoals, setUserGoals] = useState<UserGoals | null>(null);
  const [bmrResult, setBmrResult] = useState<BMRResult | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [weightRes, calorieRes, calorieHistoryRes, goalsRes] = await Promise.all([
        fetch(`${API_URL}/api/body/logs?days=365`, { headers }),
        fetch(`${API_URL}/api/body/calories/today`, { headers }),
        fetch(`${API_URL}/api/body/calories?days=30`, { headers }),
        fetch(`${API_URL}/api/body/goals`, { headers })
      ]);

      let latestWeight: number | null = null;
      if (weightRes.ok) { const d = await weightRes.json(); setWeightLogs(d); if (d.length > 0) { latestWeight = d[d.length - 1].weight; setCurrentWeight(latestWeight); } }
      if (calorieRes.ok) setCalorieLogs(await calorieRes.json());
      if (calorieHistoryRes.ok) setAllCalorieLogs(await calorieHistoryRes.json());
      if (goalsRes.ok) {
        const gData = await goalsRes.json();
        setUserGoals(gData);
        if (gData?.height && gData?.age && gData?.gender && latestWeight) {
          const r = await fetch(`${API_URL}/api/body/calculate?weight=${latestWeight}&height=${gData.height}&age=${gData.age}&gender=${gData.gender}`, { headers });
          if (r.ok) setBmrResult(await r.json());
        }
      }
    } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addWeight = async (weight: number) => { await fetch(`${API_URL}/api/body/logs`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ weight }) }); fetchAll(); };
  const addCalories = async (calories: number) => { await fetch(`${API_URL}/api/body/calories`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ calories }) }); fetchAll(); };
  const saveGoals = async (goals: any) => { await fetch(`${API_URL}/api/body/goals`, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(goals) }); fetchAll(); };

  const todayCalories = calorieLogs.reduce((s, l) => s + l.calories, 0);
  const maintenance = bmrResult?.maintenance || 0;
  const targetCalories = bmrResult ? (userGoals?.goal === 'CUT' ? bmrResult.cutting : userGoals?.goal === 'BULK' ? bmrResult.bulking : userGoals?.goal === 'LEAN_BULK' ? Math.round(bmrResult.maintenance + 250) : bmrResult.maintenance) : 0;
  const remaining = targetCalories - todayCalories;
  const deficitSurplus = todayCalories - targetCalories;
  const deficitFromTDEE = maintenance - todayCalories;
  const surplusFromTDEE = todayCalories - maintenance;
  const weeklyProjection = bmrResult ? ((deficitSurplus * 7) / 7700).toFixed(2) : '0.00';

  const planDeficitSurplus = userGoals?.goal === 'CUT' ? -500 : userGoals?.goal === 'BULK' ? 500 : userGoals?.goal === 'LEAN_BULK' ? 250 : 0;
  const planWeeklyRate = (planDeficitSurplus * 7) / 7700;
  const targetWeight = userGoals?.targetWeight || null;
  const planWeeksToGoal = targetWeight && planWeeklyRate !== 0 ? (targetWeight - (currentWeight || 0)) / planWeeklyRate : null;
  const planDaysToGoal = planWeeksToGoal ? Math.round(Math.abs(planWeeksToGoal) * 7) : null;
  const planGoalTimeline = planDaysToGoal ? (planDaysToGoal < 7 ? `~${planDaysToGoal} day${planDaysToGoal !== 1 ? 's' : ''}` : planDaysToGoal < 30 ? `~${Math.round(planDaysToGoal / 7)} week${Math.round(planDaysToGoal / 7) !== 1 ? 's' : ''}` : `~${Math.round(planDaysToGoal / 30)} month${Math.round(planDaysToGoal / 30) !== 1 ? 's' : ''}`) : 'Set a target weight';

  const weeksToGoal = targetWeight && parseFloat(weeklyProjection) !== 0 ? Math.abs((targetWeight - (currentWeight || 0)) / parseFloat(weeklyProjection)) : null;
  const daysToGoal = weeksToGoal ? Math.round(weeksToGoal * 7) : null;
  const goalTimeline = daysToGoal ? (daysToGoal < 7 ? `~${daysToGoal} day${daysToGoal !== 1 ? 's' : ''}` : daysToGoal < 30 ? `~${Math.round(daysToGoal / 7)} week${Math.round(daysToGoal / 7) !== 1 ? 's' : ''}` : `~${Math.round(daysToGoal / 30)} month${Math.round(daysToGoal / 30) !== 1 ? 's' : ''}`) : 'Set a target weight';

  const weightProgress = targetWeight && currentWeight ? Math.min(100, Math.max(0, userGoals?.goal === 'CUT' ? ((currentWeight - targetWeight) / (currentWeight - targetWeight)) * 100 : ((currentWeight - (userGoals?.targetWeight || currentWeight)) / (targetWeight - (userGoals?.targetWeight || currentWeight))) * 100)) : 0;

  const activityLabels: Record<string, string> = { SEDENTARY: 'Sedentary', LIGHT: 'Lightly Active', MODERATE: 'Moderately Active', ACTIVE: 'Very Active', ATHLETE: 'Athlete' };
  const goalLabels: Record<string, string> = { CUT: 'Cut', MAINTAIN: 'Maintain', LEAN_BULK: 'Lean Bulk', BULK: 'Bulk' };

  return { weightLogs, calorieLogs, allCalorieLogs, userGoals, bmrResult, currentWeight, isLoading, error, addWeight, addCalories, saveGoals, todayCalories, targetCalories, remaining, deficitSurplus, weeklyProjection, activityLabels, goalLabels, targetWeight, weightProgress, goalTimeline, planGoalTimeline, maintenance, deficitFromTDEE, surplusFromTDEE };
};