import React, { useState } from 'react';

interface Props {
  onComplete: (data: any) => void;
  onSkip: () => void;
  initialData?: any;
}

const STEPS = ['About You', 'Activity', 'Goal', 'Results'];

const ACTIVITIES = [
  { id: 'SEDENTARY', icon: '🪑', label: 'Sedentary', desc: 'Mostly sitting', detail: 'Desk job, little to no exercise, mostly seated throughout the day.', multiplier: '1.2', example: 'Office worker, driver, student (no sports)' },
  { id: 'LIGHT', icon: '🚶', label: 'Lightly Active', desc: 'A little walking', detail: 'Light exercise 1-3 days/week. Some walking or standing during the day.', multiplier: '1.375', example: 'Teacher, nurse (light shifts), casual gym-goer' },
  { id: 'MODERATE', icon: '🏃', label: 'Moderately Active', desc: 'Active lifestyle', detail: 'Exercise 3-5 days/week. Regular movement throughout the day.', multiplier: '1.55', example: 'Regular gym 3-4x/week, active job, daily walks' },
  { id: 'ACTIVE', icon: '🔥', label: 'Very Active', desc: 'Physical job or sports', detail: 'Intense exercise 6-7 days/week. Physically demanding job or daily training.', multiplier: '1.725', example: 'Construction worker, athlete in training, daily gym + cardio' },
  { id: 'ATHLETE', icon: '🏆', label: 'Athlete', desc: 'Intense training daily', detail: 'Twice-daily training, competitive athlete, extreme physical demands.', multiplier: '1.9', example: 'Professional athlete, bodybuilder in prep, marathon training' }
];

const GOALS = [
  { id: 'CUT', icon: '📉', label: 'Cut', desc: 'Lose body fat', kcal: -500, rate: '-0.5 kg/week' },
  { id: 'MAINTAIN', icon: '⚖️', label: 'Maintain', desc: 'Keep current weight', kcal: 0, rate: '0 kg/week' },
  { id: 'LEAN_BULK', icon: '📈', label: 'Lean Bulk', desc: 'Build muscle slowly', kcal: 250, rate: '+0.2 kg/week' },
  { id: 'BULK', icon: '🚀', label: 'Bulk', desc: 'Gain weight faster', kcal: 500, rate: '+0.5 kg/week' }
];

export const BodyOnboarding: React.FC<Props> = ({ onComplete, onSkip, initialData }) => {
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState(initialData?.gender || '');
  const [age, setAge] = useState(initialData?.age?.toString() || '');
  const [height, setHeight] = useState(initialData?.height?.toString() || '');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState(initialData?.activity || '');
  const [goal, setGoal] = useState(initialData?.goal || '');
  const [targetWeight, setTargetWeight] = useState(initialData?.targetWeight?.toString() || '');
  const [activityDetail, setActivityDetail] = useState<string | null>(null);

  const calculateBMR = () => {
    const w = parseFloat(weight), h = parseFloat(height), a = parseInt(age);
    if (!w || !h || !a || !gender) return 0;
    if (gender === 'male') return Math.round(10 * w + 6.25 * h - 5 * a + 5);
    return Math.round(10 * w + 6.25 * h - 5 * a - 161);
  };

  const getActivityMultiplier = () => {
    const multipliers: Record<string, number> = { SEDENTARY: 1.2, LIGHT: 1.375, MODERATE: 1.55, ACTIVE: 1.725, ATHLETE: 1.9 };
    return multipliers[activity] || 1.55;
  };

  const bmr = calculateBMR();
  const tdee = Math.round(bmr * getActivityMultiplier());
  const goalData = GOALS.find(g => g.id === goal);
  const goalCalories = goalData ? tdee + goalData.kcal : tdee;

  const estimatedTime = () => {
    if (!targetWeight || !goalData?.rate || parseFloat(goalData.rate) === 0) return null;
    const kgPerWeek = Math.abs(parseFloat(goalData.rate));
    const totalKg = Math.abs(parseFloat(targetWeight) - parseFloat(weight || '0'));
    if (totalKg === 0 || kgPerWeek === 0) return null;
    const weeks = totalKg / kgPerWeek;
    const days = Math.round(weeks * 7);
    if (days < 7) return `~${days} day${days !== 1 ? 's' : ''}`;
    if (days < 30) return `~${Math.round(weeks)} week${Math.round(weeks) !== 1 ? 's' : ''}`;
    return `~${Math.round(days / 30)} month${Math.round(days / 30) !== 1 ? 's' : ''}`;
  };

  const handleComplete = () => {
    onComplete({
      gender, age: parseInt(age), height: parseFloat(height), weight: parseFloat(weight),
      activity, goal, targetWeight: parseFloat(targetWeight) || null,
      bmr, tdee, goalCalories
    });
  };

  return (
    <div className="onboarding-container">
      {!initialData && <div className="onboarding-illustration">🏋️</div>}
      <h2 className="onboarding-welcome">{initialData ? 'Edit Plan' : 'Body Tracking'}</h2>
      <p className="onboarding-subtitle">{STEPS[step]}</p>

      <div className="onboarding-steps">
        {STEPS.map((_, i) => (
          <div key={i} className={`onboarding-step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} />
        ))}
      </div>

      {/* Step 1: About You */}
      {step === 0 && (
        <div className="onboarding-card">
          <h3 className="onboarding-card-title">About You</h3>
          <p style={{ fontSize: '0.813rem', color: '#71717a', marginBottom: '1rem' }}>This helps us calculate your Basal Metabolic Rate (BMR).</p>
          <label className="field-label">Sex</label>
          <div className="option-grid" style={{ marginBottom: '0.75rem' }}>
            <div className={`option-card ${gender === 'male' ? 'selected' : ''}`} onClick={() => setGender('male')}>
              <span className="option-card-label">♂ Male</span>
            </div>
            <div className={`option-card ${gender === 'female' ? 'selected' : ''}`} onClick={() => setGender('female')}>
              <span className="option-card-label">♀ Female</span>
            </div>
          </div>
          <label className="field-label">Age</label>
          <input className="onboarding-input" type="number" placeholder="Your age" value={age} onChange={e => setAge(e.target.value)} />
          <label className="field-label">Height</label>
          <input className="onboarding-input" type="number" placeholder="Height in cm" value={height} onChange={e => setHeight(e.target.value)} />
          <label className="field-label">Current Weight</label>
          <input className="onboarding-input" type="number" placeholder="Weight in kg" value={weight} onChange={e => setWeight(e.target.value)} />
          <button className="btn-onboarding" disabled={!gender || !age || !height || !weight} onClick={() => setStep(1)}>Continue →</button>
        </div>
      )}

      {/* Step 2: Activity */}
      {step === 1 && (
        <div className="onboarding-card">
          <h3 className="onboarding-card-title">How active are you?</h3>
          <p style={{ fontSize: '0.813rem', color: '#71717a', marginBottom: '1rem' }}>This determines your Total Daily Energy Expenditure (TDEE). Choose the option that best describes your <strong>overall lifestyle</strong>.</p>
          {activityDetail ? (
            <div style={{ marginBottom: '1rem' }}>
              <button className="btn-onboarding-secondary" onClick={() => setActivityDetail(null)} style={{ marginBottom: '0.75rem', textAlign: 'left' }}>← Back to all options</button>
              {ACTIVITIES.filter(a => a.id === activityDetail).map(a => (
                <div key={a.id} className="onboarding-card" style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{a.icon}</div>
                  <h4 style={{ color: '#fafafa', fontSize: '1rem', marginBottom: '0.25rem' }}>{a.label}</h4>
                  <p style={{ color: '#a1a1aa', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>{a.detail}</p>
                  <div style={{ background: '#111113', borderRadius: 8, padding: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#71717a', fontSize: '0.688rem' }}>Activity Multiplier: </span>
                    <span style={{ color: '#a78bfa', fontWeight: 700 }}>×{a.multiplier}</span>
                  </div>
                  <div style={{ background: '#111113', borderRadius: 8, padding: '0.75rem' }}>
                    <span style={{ color: '#71717a', fontSize: '0.688rem' }}>Example: </span>
                    <span style={{ color: '#a1a1aa', fontSize: '0.813rem' }}>{a.example}</span>
                  </div>
                  <button className="btn-onboarding" onClick={() => { setActivity(a.id); setActivityDetail(null); }} style={{ marginTop: '0.75rem' }}>Select "{a.label}"</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="option-grid">
              {ACTIVITIES.map(a => (
                <div key={a.id} className={`option-card ${activity === a.id ? 'selected' : ''}`} onClick={() => setActivityDetail(a.id)}>
                  <div className="option-card-icon">{a.icon}</div>
                  <div className="option-card-label">{a.label}</div>
                  <div className="option-card-desc">{a.desc}</div>
                  <div style={{ fontSize: '0.625rem', color: '#a78bfa', marginTop: '0.25rem' }}>×{a.multiplier}</div>
                </div>
              ))}
            </div>
          )}
          {activity && !activityDetail && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(124,58,237,0.1)', borderRadius: 8, textAlign: 'center' }}>
              <span style={{ color: '#a78bfa', fontSize: '0.875rem', fontWeight: 600 }}>{ACTIVITIES.find(a => a.id === activity)?.label} selected ✓</span>
            </div>
          )}
          <button className="btn-onboarding" disabled={!activity} onClick={() => setStep(2)} style={{ marginTop: '1rem' }}>Continue →</button>
        </div>
      )}

      {/* Step 3: Goal */}
      {step === 2 && (
        <div className="onboarding-card">
          <h3 className="onboarding-card-title">What's your goal?</h3>
          <p style={{ fontSize: '0.813rem', color: '#71717a', marginBottom: '1rem' }}>This determines your daily calorie target.</p>
          <div className="option-grid">
            {GOALS.map(g => (
              <div key={g.id} className={`option-card ${goal === g.id ? 'selected' : ''}`} onClick={() => setGoal(g.id)}>
                <div className="option-card-icon">{g.icon}</div>
                <div className="option-card-label">{g.label}</div>
                <div className="option-card-desc">{g.desc}</div>
                <div style={{ fontSize: '0.625rem', color: g.kcal < 0 ? '#ef4444' : g.kcal > 0 ? '#22c55e' : '#a1a1aa', marginTop: '0.25rem' }}>
                  {g.kcal === 0 ? 'TDEE' : g.kcal > 0 ? `TDEE +${g.kcal}` : `TDEE ${g.kcal}`}
                </div>
              </div>
            ))}
          </div>
          {goal && goal !== 'MAINTAIN' && (
            <div style={{ marginTop: '1rem' }}>
              <label className="field-label">Target Weight (kg)</label>
              <input className="onboarding-input" type="number" placeholder={goal === 'CUT' ? 'Weight you want to reach' : 'Target weight'} value={targetWeight} onChange={e => setTargetWeight(e.target.value)} />
            </div>
          )}
          <button className="btn-onboarding" disabled={!goal || (goal !== 'MAINTAIN' && !targetWeight)} onClick={() => setStep(3)} style={{ marginTop: '1rem' }}>Calculate →</button>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 3 && (
        <div className="onboarding-card">
          <h3 className="onboarding-card-title">Your Plan</h3>
          <p style={{ fontSize: '0.813rem', color: '#71717a', marginBottom: '1rem', textAlign: 'center' }}>Based on your profile, here's your personalized nutrition plan.</p>
          <div className="onboarding-result">
            <div className="result-row"><span>BMR</span><span>{bmr} kcal</span></div>
            <div className="result-row"><span>Maintenance (TDEE)</span><span>{tdee} kcal</span></div>
            <div className="result-row"><span>Goal Calories</span><span style={{ color: '#a78bfa' }}>{goalCalories} kcal</span></div>
            {targetWeight && <div className="result-row"><span>Target Weight</span><span style={{ color: '#a78bfa' }}>{targetWeight} kg</span></div>}
            <div className="result-row"><span>Expected</span><span style={{ color: goalData?.kcal && goalData.kcal < 0 ? '#ef4444' : '#22c55e' }}>{goalData?.rate}</span></div>
            {estimatedTime() && (
              <div className="result-row" style={{ borderBottom: 'none' }}>
                <span>⏱️ Estimated Time</span>
                <span style={{ color: '#f59e0b' }}>{estimatedTime()}</span>
              </div>
            )}
          </div>
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(124,58,237,0.08)', borderRadius: 8, textAlign: 'center' }}>
            <p style={{ color: '#a78bfa', fontSize: '0.813rem', lineHeight: 1.5 }}>
              {goal === 'CUT' && 'To lose body fat, maintain a consistent deficit. Pair with high protein intake and strength training to preserve muscle.'}
              {goal === 'MAINTAIN' && 'To keep your current weight, eat at maintenance. Focus on nutrient-dense foods and consistent training.'}
              {goal === 'LEAN_BULK' && 'To build muscle with minimal fat gain, aim for a small surplus. Prioritize protein and progressive overload in your workouts.'}
              {goal === 'BULK' && 'To gain weight and strength faster, maintain a consistent surplus. Combine with high-volume training for maximum growth.'}
            </p>
          </div>
          <button className="btn-onboarding" onClick={handleComplete} style={{ marginTop: '1rem' }}>Start Tracking</button>
        </div>
      )}

     
    </div>
  );
};