import React, { useState, useEffect } from 'react';
import { WeightChart } from './WeightChart';
import { CalorieHistory } from './CalorieHistory';
import { Toast } from '../ui/Toast';
import { InfoTooltip } from '../ui/InfoTooltip';
import { API_URL } from '../../lib/api';

interface Props { body: any; onEditPlan: () => void; }

export const BodyDashboard: React.FC<Props> = ({ body, onEditPlan }) => {
  const { weightLogs, allCalorieLogs, currentWeight, bmrResult, userGoals, isLoading, addWeight, addCalories, todayCalories, targetCalories, remaining, weeklyProjection, goalLabels, activityLabels, targetWeight, weightProgress, goalTimeline, planGoalTimeline, maintenance, deficitFromTDEE, surplusFromTDEE } = body;

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
    const animate = (s: any, f: number, t: number) => { let st=0; const d=800, steps=20, int=d/steps; const ti=setInterval(()=>{st++;const e=1-Math.pow(1-st/steps,3);s(Math.round(f+(t-f)*e));if(st>=steps)clearInterval(ti);},int); };
    if (bmrResult?.bmr) animate(setAnimBMR,0,bmrResult.bmr);
    if (bmrResult?.maintenance) animate(setAnimTDEE,0,bmrResult.maintenance);
    if (targetCalories) animate(setAnimTarget,0,targetCalories);
    if (todayCalories) animate(setAnimCalories,0,todayCalories);
    if (currentWeight) animate(setAnimWeight,0,Math.round(currentWeight));
  }, [bmrResult, targetCalories, todayCalories, currentWeight]);

  const tdee = animTDEE || maintenance || 0;
  const progressPercent = targetCalories > 0 ? Math.min((todayCalories / targetCalories) * 100, 100) : 0;
  const ringCircumference = 283;
  const ringOffset = ringCircumference - (progressPercent / 100) * ringCircumference;
  const isCut = userGoals?.goal === 'CUT', isBulk = userGoals?.goal === 'BULK' || userGoals?.goal === 'LEAN_BULK', isMaintain = userGoals?.goal === 'MAINTAIN';

  let circleColor = '#7c3aed';
  if (isCut) { const d=deficitFromTDEE; if (d>700) circleColor='#22c55e'; else if (d>=300) circleColor='#22c55e'; else if (d>0) circleColor='#f59e0b'; else circleColor='#ef4444'; }
  else if (isBulk) { const s=surplusFromTDEE; if (s>=250&&s<=500) circleColor='#22c55e'; else if (s>0&&s<250) circleColor='#f59e0b'; else if (s>500&&s<=1000) circleColor='#f59e0b'; else if (s>1000) circleColor='#ef4444'; else circleColor='#ef4444'; }
  else if (isMaintain) { const d=surplusFromTDEE; if (Math.abs(d)<=100) circleColor='#22c55e'; else circleColor='#f59e0b'; }

  let deficitColor='#22c55e', deficitLabel='', deficitTooltip='';
  if (isCut) { const d=deficitFromTDEE; if (d>700){deficitColor='#ef4444';deficitLabel=`Deficit Today ${d} kcal`;deficitTooltip='⚠️ Too few calories!';} else if (d>=300){deficitColor='#22c55e';deficitLabel=`Deficit Today ${d} kcal`;deficitTooltip='✅ Good deficit.';} else if (d>0){deficitColor='#f59e0b';deficitLabel=`Deficit Today ${d} kcal`;deficitTooltip='⚠️ Small deficit.';} else {deficitColor='#ef4444';deficitLabel=`Surplus Today ${surplusFromTDEE} kcal`;deficitTooltip='❌ Above maintenance!';} }
  else if (isBulk) { const s=surplusFromTDEE; if (s>=250&&s<=500){deficitColor='#22c55e';deficitLabel=`Surplus Today ${s} kcal`;deficitTooltip='✅ Optimal surplus.';} else if (s>0&&s<250){deficitColor='#f59e0b';deficitLabel=`Surplus Today ${s} kcal`;deficitTooltip='⚠️ Small surplus.';} else if (s>500&&s<=1000){deficitColor='#f59e0b';deficitLabel=`Surplus Today ${s} kcal`;deficitTooltip='⚠️ Higher surplus.';} else if (s>1000){deficitColor='#ef4444';deficitLabel=`Surplus Today ${s} kcal`;deficitTooltip='❌ Excessive surplus!';} else {deficitColor='#ef4444';deficitLabel=`Deficit Today ${-s} kcal`;deficitTooltip='❌ Below maintenance!';} }
  else if (isMaintain) { const d=surplusFromTDEE; if (Math.abs(d)<=100){deficitColor='#22c55e';deficitLabel=`Balance ±${Math.abs(d)} kcal`;deficitTooltip='✅ Perfect!';} else {deficitColor='#f59e0b';deficitLabel=d>0?`Surplus ${d} kcal`:`Deficit ${-d} kcal`;deficitTooltip='⚠️ Stay closer to maintenance.';} }

  const goalMessages: Record<string,string> = { CUT:'To lose body fat, maintain a consistent deficit of 300-700 kcal.', MAINTAIN:'To keep your current weight, eat at maintenance.', LEAN_BULK:'To build muscle with minimal fat gain, aim for a surplus of 250-500 kcal.', BULK:'To gain weight and strength faster, maintain a surplus of 250-500 kcal.' };

  const handleResetPlan = async () => { try { await fetch(`${API_URL}/api/body/goals`,{method:'DELETE',headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}}); setShowResetModal(false); window.location.reload(); } catch { setToast({message:'Failed to reset plan',icon:'❌',type:'error'}); } };

  if (isLoading) return (<><div className="skeleton" style={{height:32,width:'40%',marginBottom:20}}/><div className="body-cards">{[1,2,3,4,5].map(i=><div key={i} className="skeleton skeleton-card"/>)}</div><div className="skeleton" style={{height:250,borderRadius:14,marginBottom:16}}/></>);

  return (<>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}><h1 className="body-title" style={{marginBottom:0}}>Body Tracker</h1><button onClick={onEditPlan} className="edit-plan-btn">⚙️ Edit Plan</button></div>

    <div className="body-cards">
      <div className="body-card body-card-full pulse-glow"><span className="body-card-icon">⚖️</span><span className="body-card-value">{animWeight||currentWeight||'--'} kg</span><span className="body-card-label">Current Weight</span></div>
      <div className="body-card"><span className="body-card-icon">🔥</span><span className="body-card-value">{animBMR||'--'} <InfoTooltip title="BMR" content="Basal Metabolic Rate: calories your body burns at complete rest."/></span><span className="body-card-label">BMR (kcal)</span></div>
      <div className="body-card"><span className="body-card-icon">⚡</span><span className="body-card-value">{animTDEE||'--'} <InfoTooltip title="TDEE" content="Total Daily Energy Expenditure: calories you burn per day including activity."/></span><span className="body-card-label">TDEE (kcal)</span></div>
      <div className="body-card"><span className="body-card-icon">🎯</span><span className="body-card-value">{userGoals?goalLabels[userGoals.goal]:'--'}</span><span className="body-card-label">Goal</span></div>
      <div className="body-card"><span className="body-card-icon">📊</span><span className="body-card-value">{animTarget||'--'} <InfoTooltip title="Target Calories" content="Your daily calorie goal based on your objective."/></span><span className="body-card-label">Target kcal</span></div>
    </div>

    {targetWeight && currentWeight && (<div className="goal-card" style={{marginBottom:'1rem'}}><h3 className="section-title" style={{marginTop:0}}>Weight Goal</h3><div className="goal-card-row"><span>Current</span><span>{currentWeight} kg</span></div><div className="goal-card-row"><span>Target</span><span style={{color:'#a78bfa'}}>{targetWeight} kg</span></div><div className="goal-card-row"><span>Remaining</span><span>{Math.abs(targetWeight-currentWeight).toFixed(1)} kg</span></div><div className="goal-card-row"><span>Estimated <InfoTooltip title="Plan Estimate" content="Based on your goal and target weight."/></span><span>{planGoalTimeline}</span></div><div style={{marginTop:'0.75rem'}}><div style={{display:'flex',justifyContent:'space-between',fontSize:'0.688rem',color:'#71717a',marginBottom:'0.25rem'}}><span>{(userGoals?.goal==='BULK'||userGoals?.goal==='LEAN_BULK')?currentWeight:targetWeight} kg</span><span>{(userGoals?.goal==='BULK'||userGoals?.goal==='LEAN_BULK')?targetWeight:currentWeight} kg</span></div><div className="weight-goal-bar"><div className="weight-goal-fill" style={{width:`${Math.min(Math.max(weightProgress,0),100)}%`}}/></div></div></div>)}

    <WeightChart data={weightLogs}/>
    <button className="body-btn" style={{width:'100%',marginBottom:'1rem'}} onClick={()=>setShowWeightModal(true)}>+ Add Weight</button>

    <div className="nutrition-section">
      <h3 className="section-title" style={{marginTop:0}}>Daily Calories</h3>
      <div className="calorie-ring"><svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="45" fill="none" stroke="#111113" strokeWidth="8"/><circle cx="60" cy="60" r="45" fill="none" stroke={circleColor} strokeWidth="8" strokeDasharray={ringCircumference} strokeDashoffset={ringOffset} strokeLinecap="round"/></svg><div className="calorie-ring-text"><span className="calorie-ring-value">{animCalories||todayCalories||0}</span><span className="calorie-ring-target">/ {targetCalories||0}</span></div></div>
      <div className="calorie-stats"><div className="calorie-stat">Target<strong>{targetCalories||0}</strong></div><div className="calorie-stat">Consumed<strong>{todayCalories}</strong></div><div className="calorie-stat">Remaining<strong>{remaining>0?remaining:0}</strong></div></div>
      <div className="body-input-row"><input type="number" className="body-input" placeholder="Calories" value={calorieInput} onChange={e=>setCalorieInput(e.target.value)}/><button className="body-btn" onClick={async()=>{const v=parseInt(calorieInput);if(!v||v<=0)return;await addCalories(v);setCalorieInput('');setToast({message:'Calories logged!',icon:'🍽️',type:'success'});}}>Add</button></div>
      <p style={{fontSize:'0.625rem',color:'#52525b',textAlign:'center',marginTop:'0.5rem'}}>Resets at midnight</p>
    </div>

    {/* Message déficit/surplus remonté juste après Daily Calories */}
    <div className="deficit-card" style={{borderColor:deficitColor,color:deficitColor,background:`${deficitColor}15`}}>{deficitLabel}<InfoTooltip title="Info" content={deficitTooltip}/></div>

    {isCut&&deficitFromTDEE>700&&<div className="disclaimer-card deficit">⚠️ Severe deficit! Risk of muscle loss, metabolic slowdown, and nutritional deficiencies.</div>}
    {isCut&&deficitFromTDEE<0&&<div className="disclaimer-card surplus">⚠️ You are eating above maintenance! This will prevent fat loss.</div>}
    {isBulk&&surplusFromTDEE>1000&&<div className="disclaimer-card surplus">⚠️ Excessive surplus! High risk of unnecessary fat gain and health issues.</div>}
    {isBulk&&surplusFromTDEE<0&&<div className="disclaimer-card deficit">⚠️ You are eating below maintenance! This will limit muscle growth.</div>}

    {/* Calorie History avec calendrier */}
    {allCalorieLogs && allCalorieLogs.length > 0 && <CalorieHistory logs={allCalorieLogs} targetCalories={targetCalories||0}/>}

    <div className="goal-card"><h3 className="section-title" style={{marginTop:0}}>Current Goal</h3><div className="goal-card-row"><span>Goal</span><span>{userGoals?goalLabels[userGoals.goal]:'--'}</span></div><div className="goal-card-row"><span>Activity</span><span>{userGoals?activityLabels[userGoals.activity]:'--'}</span></div><div className="goal-card-row"><span>Maintenance</span><span>{tdee||maintenance||0} kcal</span></div><div className="goal-card-row"><span>Target</span><span>{targetCalories||0} kcal</span></div><div className="goal-card-row"><span>Estimated</span><span>{weeklyProjection} kg/week</span></div><p style={{fontSize:'0.813rem',color:'#a78bfa',marginTop:'0.75rem',lineHeight:1.5}}>{userGoals?goalMessages[userGoals.goal]:''}</p><button className="btn-reset-plan" onClick={()=>setShowResetModal(true)}>🗑️ Reset Plan</button></div>

    <h3 className="section-title">Weight History</h3>
    {weightLogs.slice().reverse().slice(0,10).map((log:any)=>(<div key={log.id} className="weight-history-item"><span className="weight-history-value">{log.weight} kg</span><span className="weight-history-date">{new Date(log.date).toLocaleDateString()}</span></div>))}

    {showWeightModal&&<div className="modal-overlay" onClick={()=>setShowWeightModal(false)}><div className="modal-content" onClick={e=>e.stopPropagation()}><h3 style={{color:'#fafafa',marginBottom:'1rem'}}>Add Weight</h3><input type="number" className="body-input" placeholder="Weight (kg)" value={weightInput} onChange={e=>setWeightInput(e.target.value)} autoFocus/><button className="btn-onboarding" onClick={async()=>{const v=parseFloat(weightInput);if(!v||v<=0)return;await addWeight(v);setWeightInput('');setShowWeightModal(false);setToast({message:'Weight logged!',icon:'✅',type:'success'});}}>Save</button></div></div>}
    {showResetModal&&<div className="modal-overlay" onClick={()=>setShowResetModal(false)}><div className="modal-content" onClick={e=>e.stopPropagation()}><h3 className="modal-title">Reset Plan</h3><p style={{color:'#a1a1aa',fontSize:'0.875rem',marginBottom:'1.5rem'}}>Your weight logs and calorie history will be kept.</p><div className="modal-actions"><button className="btn-cancel" onClick={()=>setShowResetModal(false)}>Cancel</button><button className="btn-save" style={{background:'#ef4444'}} onClick={handleResetPlan}>Reset</button></div></div></div>}
    {toast&&<Toast message={toast.message} icon={toast.icon} type={toast.type} onClose={()=>setToast(null)}/>}
  </>);
};