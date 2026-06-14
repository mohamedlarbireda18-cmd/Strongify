import React, { useState, useEffect } from 'react';
import { WeightChart } from './WeightChart';
import { Toast } from '../ui/Toast';
import { InfoTooltip } from '../ui/InfoTooltip';
import { API_URL } from '../../lib/api';

interface Props {
  body: any;
  onEditPlan: () => void;
}

export const BodyDashboard: React.FC<Props> = ({ body, onEditPlan }) => {
  const {
    weightLogs, currentWeight, bmrResult, userGoals, isLoading,
    addWeight, addCalories,
    todayCalories, targetCalories, remaining, weeklyProjection,
    goalLabels, activityLabels,
    targetWeight, weightProgress, goalTimeline, planGoalTimeline,
    maintenance, deficitFromTDEE, surplusFromTDEE
  } = body;

  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [calorieInput, setCalorieInput] = useState('');
  const [toast, setToast] = useState<any>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const [animBMR, setAnimBMR] = useState(0);
  const [animTDEE, setAnimTDEE] = useState(0);
  const [animTarget, setAnimTarget] = useState(0);
  const [animCalories, setAnimCalories] = useState(0);
  const [animWeight, setAnimWeight] = useState(0);

  useEffect(() => {
    const animate = (setter: any, from: number, to: number) => {
      const duration = 800, steps = 20, interval = duration / steps;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const eased = 1 - Math.pow(1 - step / steps, 3);
        setter(Math.round(from + (to - from) * eased));
        if (step >= steps) clearInterval(timer);
      }, interval);
    };
    if (bmrResult?.bmr) animate(setAnimBMR, 0, bmrResult.bmr);
    if (bmrResult?.maintenance) animate(setAnimTDEE, 0, bmrResult.maintenance);
    if (targetCalories) animate(setAnimTarget, 0, targetCalories);
    if (todayCalories) animate(setAnimCalories, 0, todayCalories);
    if (currentWeight) animate(setAnimWeight, 0, Math.round(currentWeight));
  }, [bmrResult, targetCalories, todayCalories, currentWeight]);

  const tdee = animTDEE || maintenance || 0;
  const progressPercent = targetCalories > 0 ? Math.min((todayCalories / targetCalories) * 100, 100) : 0;
  const ringCircumference = 283;
  const ringOffset = ringCircumference - (progressPercent / 100) * ringCircumference;

  const isCut = userGoals?.goal === 'CUT';
  const isBulk = userGoals?.goal === 'BULK' || userGoals?.goal === 'LEAN_BULK';
  const isMaintain = userGoals?.goal === 'MAINTAIN';

  // === COULEUR DU CERCLE ===
  let circleColor = '#7c3aed'; // défaut violet
  if (isCut) {
    const def = deficitFromTDEE;
    if (def > 700) circleColor = '#22c55e';       // bon déficit → vert
    else if (def >= 300) circleColor = '#22c55e';  // bon déficit → vert
    else if (def > 0) circleColor = '#f59e0b';     // petit déficit → orange
    else circleColor = '#ef4444';                   // surplus → rouge
  } else if (isBulk) {
    const sur = surplusFromTDEE;
    if (sur >= 250 && sur <= 500) circleColor = '#22c55e';  // optimal → vert
    else if (sur > 0 && sur < 250) circleColor = '#f59e0b'; // petit → orange
    else if (sur > 500 && sur <= 1000) circleColor = '#f59e0b'; // élevé → orange
    else if (sur > 1000) circleColor = '#ef4444';   // excessif → rouge
    else circleColor = '#ef4444';                     // déficit → rouge
  } else if (isMaintain) {
    const diff = surplusFromTDEE;
    if (Math.abs(diff) <= 100) circleColor = '#22c55e';  // parfait → vert
    else circleColor = '#f59e0b';                         // écart → orange
  }

  // === MESSAGE DÉFICIT/SURPLUS ===
  let deficitColor = '#22c55e';
  let deficitLabel = '';
  let deficitTooltip = '';

  if (isCut) {
    const def = deficitFromTDEE;
    if (def > 700) {
      deficitColor = '#ef4444';
      deficitLabel = `Deficit Today ${def} kcal`;
      deficitTooltip = '⚠️ Too few calories! Risk of muscle loss, metabolic slowdown, and nutritional deficiencies. Increase your intake.';
    } else if (def >= 300) {
      deficitColor = '#22c55e';
      deficitLabel = `Deficit Today ${def} kcal`;
      deficitTooltip = '✅ Good deficit. Promotes steady fat loss while preserving muscle.';
    } else if (def > 0) {
      deficitColor = '#f59e0b';
      deficitLabel = `Deficit Today ${def} kcal`;
      deficitTooltip = '⚠️ Small deficit. Slower progress but still in the right direction.';
    } else {
      deficitColor = '#ef4444';
      deficitLabel = `Surplus Today ${surplusFromTDEE} kcal`;
      deficitTooltip = '❌ You are eating above maintenance! This will prevent fat loss.';
    }
  } else if (isBulk) {
    const sur = surplusFromTDEE;
    if (sur >= 250 && sur <= 500) {
      deficitColor = '#22c55e';
      deficitLabel = `Surplus Today ${sur} kcal`;
      deficitTooltip = '✅ Optimal surplus for muscle gain with minimal fat.';
    } else if (sur > 0 && sur < 250) {
      deficitColor = '#f59e0b';
      deficitLabel = `Surplus Today ${sur} kcal`;
      deficitTooltip = '⚠️ Small surplus. Muscle growth may be slower.';
    } else if (sur > 500 && sur <= 1000) {
      deficitColor = '#f59e0b';
      deficitLabel = `Surplus Today ${sur} kcal`;
      deficitTooltip = '⚠️ Higher surplus. May lead to more fat gain.';
    } else if (sur > 1000) {
      deficitColor = '#ef4444';
      deficitLabel = `Surplus Today ${sur} kcal`;
      deficitTooltip = '❌ Excessive surplus! High risk of unnecessary fat gain and health issues.';
    } else {
      deficitColor = '#ef4444';
      deficitLabel = `Deficit Today ${-sur} kcal`;
      deficitTooltip = '❌ You are eating below maintenance! This will limit muscle growth.';
    }
  } else if (isMaintain) {
    const diff = surplusFromTDEE;
    if (Math.abs(diff) <= 100) {
      deficitColor = '#22c55e';
      deficitLabel = `Balance ±${Math.abs(diff)} kcal`;
      deficitTooltip = '✅ Perfect! You are eating at maintenance.';
    } else {
      deficitColor = '#f59e0b';
      deficitLabel = diff > 0 ? `Surplus ${diff} kcal` : `Deficit ${-diff} kcal`;
      deficitTooltip = '⚠️ Try to stay closer to maintenance to keep your weight stable.';
    }
  }

  const goalMessages: Record<string, string> = {
    CUT: 'To lose body fat, maintain a consistent deficit of 300-700 kcal. Pair with high protein intake and strength training.',
    MAINTAIN: 'To keep your current weight, eat at maintenance. Focus on nutrient-dense foods and consistent training.',
    LEAN_BULK: 'To build muscle with minimal fat gain, aim for a surplus of 250-500 kcal. Prioritize protein and progressive overload.',
    BULK: 'To gain weight and strength faster, maintain a surplus of 250-500 kcal. Combine with high-volume training.'
  };

  const handleResetPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/body/goals`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowResetModal(false);
      window.location.reload();
    } catch {
      setToast({ message: 'Failed to reset plan', icon: '❌', type: 'error' });
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="skeleton" style={{ height: 32, width: '40%', marginBottom: 20 }} />
        <div className="body-cards">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton skeleton-card" />)}
        </div>
        <div className="skeleton" style={{ height: 250, borderRadius: 14, marginBottom: 16 }} />
      </>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 className="body-title" style={{ marginBottom: 0 }}>Body Tracker</h1>
        <button onClick={onEditPlan} className="edit-plan-btn">⚙️ Edit Plan</button>
      </div>

      <div className="body-cards">
        <div className="body-card body-card-full pulse-glow">
          <span className="body-card-icon">⚖️</span>
          <span className="body-card-value">{animWeight || currentWeight || '--'} kg</span>
          <span className="body-card-label">Current Weight</span>
        </div>
        <div className="body-card">
          <span className="body-card-icon">🔥</span>
          <span className="body-card-value">{animBMR || '--'} <InfoTooltip title="BMR" content="Basal Metabolic Rate: calories your body burns at complete rest." /></span>
          <span className="body-card-label">BMR (kcal)</span>
        </div>
        <div className="body-card">
          <span className="body-card-icon">⚡</span>
          <span className="body-card-value">{animTDEE || '--'} <InfoTooltip title="TDEE" content="Total Daily Energy Expenditure: calories you burn per day including activity." /></span>
          <span className="body-card-label">TDEE (kcal)</span>
        </div>
        <div className="body-card">
          <span className="body-card-icon">🎯</span>
          <span className="body-card-value">{userGoals ? goalLabels[userGoals.goal] : '--'}</span>
          <span className="body-card-label">Goal</span>
        </div>
        <div className="body-card">
          <span className="body-card-icon">📊</span>
          <span className="body-card-value">{animTarget || '--'} <InfoTooltip title="Target Calories" content="Your daily calorie goal based on your objective." /></span>
          <span className="body-card-label">Target kcal</span>
        </div>
      </div>

      {targetWeight && currentWeight && (
        <div className="goal-card" style={{ marginBottom: '1rem' }}>
          <h3 className="section-title" style={{ marginTop: 0 }}>Weight Goal</h3>
          <div className="goal-card-row"><span>Current</span><span>{currentWeight} kg</span></div>
          <div className="goal-card-row"><span>Target</span><span style={{ color: '#a78bfa' }}>{targetWeight} kg</span></div>
          <div className="goal-card-row"><span>Remaining</span><span>{Math.abs(targetWeight - currentWeight).toFixed(1)} kg</span></div>
          <div className="goal-card-row">
            <span>Estimated <InfoTooltip title="Plan Estimate" content="Based on your goal and target weight, not actual daily intake. Real progress may vary." /></span>
            <span>{planGoalTimeline}</span>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.688rem', color: '#71717a', marginBottom: '0.25rem' }}>
              <span>{userGoals?.goal === 'BULK' || userGoals?.goal === 'LEAN_BULK' ? currentWeight : targetWeight} kg</span>
              <span>{userGoals?.goal === 'BULK' || userGoals?.goal === 'LEAN_BULK' ? targetWeight : currentWeight} kg</span>
            </div>
            <div className="weight-goal-bar">
              <div className="weight-goal-fill" style={{ width: `${Math.min(Math.max(weightProgress, 0), 100)}%` }} />
            </div>
          </div>
        </div>
      )}

      <WeightChart data={weightLogs} />
      <button className="body-btn" style={{ width: '100%', marginBottom: '1rem' }} onClick={() => setShowWeightModal(true)}>+ Add Weight</button>

      <div className="nutrition-section">
        <h3 className="section-title" style={{ marginTop: 0 }}>Daily Calories</h3>
        <div className="calorie-ring">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="45" fill="none" stroke="#111113" strokeWidth="8" />
            <circle cx="60" cy="60" r="45" fill="none" stroke={circleColor} strokeWidth="8"
              strokeDasharray={ringCircumference} strokeDashoffset={ringOffset} strokeLinecap="round" />
          </svg>
          <div className="calorie-ring-text">
            <span className="calorie-ring-value">{animCalories || todayCalories || 0}</span>
            <span className="calorie-ring-target">/ {targetCalories || 0}</span>
          </div>
        </div>
        <div className="calorie-stats">
          <div className="calorie-stat">Target<strong>{targetCalories || 0}</strong></div>
          <div className="calorie-stat">Consumed<strong>{todayCalories}</strong></div>
          <div className="calorie-stat">Remaining<strong>{remaining > 0 ? remaining : 0}</strong></div>
        </div>
        <div className="body-input-row">
          <input type="number" className="body-input" placeholder="Calories" value={calorieInput} onChange={e => setCalorieInput(e.target.value)} />
          <button className="body-btn" onClick={async () => {
            const val = parseInt(calorieInput);
            if (!val || val <= 0) return;
            await addCalories(val);
            setCalorieInput('');
            setToast({ message: 'Calories logged!', icon: '🍽️', type: 'success' });
          }}>Add</button>
        </div>
        <p style={{ fontSize: '0.625rem', color: '#52525b', textAlign: 'center', marginTop: '0.5rem' }}>Resets at midnight</p>
      </div>

      <div className="deficit-card" style={{ borderColor: deficitColor, color: deficitColor, background: `${deficitColor}15` }}>
        {deficitLabel}
        <InfoTooltip title="Info" content={deficitTooltip} />
      </div>

      {isCut && deficitFromTDEE > 700 && (
        <div className="disclaimer-card deficit">
          ⚠️ Severe deficit! Risk of muscle loss, metabolic slowdown, and nutritional deficiencies. Increase your intake.
        </div>
      )}
      {isCut && deficitFromTDEE < 0 && (
        <div className="disclaimer-card surplus">
          ⚠️ You are eating above maintenance! This will prevent fat loss.
        </div>
      )}
      {isBulk && surplusFromTDEE > 1000 && (
        <div className="disclaimer-card surplus">
          ⚠️ Excessive surplus! High risk of unnecessary fat gain and health issues.
        </div>
      )}
      {isBulk && surplusFromTDEE < 0 && (
        <div className="disclaimer-card deficit">
          ⚠️ You are eating below maintenance! This will limit muscle growth.
        </div>
      )}

      <div className="goal-card">
        <h3 className="section-title" style={{ marginTop: 0 }}>Current Goal</h3>
        <div className="goal-card-row"><span>Goal</span><span>{userGoals ? goalLabels[userGoals.goal] : '--'}</span></div>
        <div className="goal-card-row"><span>Activity</span><span>{userGoals ? activityLabels[userGoals.activity] : '--'}</span></div>
        <div className="goal-card-row"><span>Maintenance</span><span>{tdee || maintenance || 0} kcal</span></div>
        <div className="goal-card-row"><span>Target</span><span>{targetCalories || 0} kcal</span></div>
        <div className="goal-card-row"><span>Estimated</span><span>{weeklyProjection} kg/week</span></div>
        <p style={{ fontSize: '0.813rem', color: '#a78bfa', marginTop: '0.75rem', lineHeight: 1.5 }}>
          {userGoals ? goalMessages[userGoals.goal] : ''}
        </p>
        <button className="btn-reset-plan" onClick={() => setShowResetModal(true)}>🗑️ Reset Plan</button>
      </div>

      <h3 className="section-title">Weight History</h3>
      {weightLogs.slice().reverse().slice(0, 10).map((log: any) => (
        <div key={log.id} className="weight-history-item">
          <span className="weight-history-value">{log.weight} kg</span>
          <span className="weight-history-date">{new Date(log.date).toLocaleDateString()}</span>
        </div>
      ))}

      {showWeightModal && (
        <div className="modal-overlay" onClick={() => setShowWeightModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#fafafa', marginBottom: '1rem' }}>Add Weight</h3>
            <input type="number" className="body-input" placeholder="Weight (kg)" value={weightInput} onChange={e => setWeightInput(e.target.value)} autoFocus />
            <button className="btn-onboarding" onClick={async () => {
              const val = parseFloat(weightInput);
              if (!val || val <= 0) return;
              await addWeight(val);
              setWeightInput('');
              setShowWeightModal(false);
              setToast({ message: 'Weight logged!', icon: '✅', type: 'success' });
            }}>Save</button>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Reset Plan</h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Your weight logs and calorie history will be kept. You will be able to set a new plan.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowResetModal(false)}>Cancel</button>
              <button className="btn-save" style={{ background: '#ef4444' }} onClick={handleResetPlan}>Reset</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} icon={toast.icon} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};