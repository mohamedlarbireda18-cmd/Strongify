import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { InfoTooltip } from '../ui/InfoTooltip';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface CalorieLog {
  id: string;
  calories: number;
  date: string;
}

interface Props {
  logs: CalorieLog[];
  targetCalories: number;
  maintenance: number; // ajouté : calories de maintenance (TDEE)
}

const INITIAL_VISIBLE_LOGS = 5;
const LOGS_PER_CLICK = 5;

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalorieHistory: React.FC<Props> = ({ logs, targetCalories, maintenance }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [visibleLogs, setVisibleLogs] = useState<number>(INITIAL_VISIBLE_LOGS);

  // Calculer le début (dimanche) et la fin (samedi) de la semaine contenant selectedDate
  const weekRange = useMemo(() => {
    const date = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = date.getDay(); // 0 = dimanche
    const start = new Date(date);
    start.setDate(date.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, [selectedDate]);

  // Filtrer les logs sur cette semaine
  const weekLogs = useMemo(() => {
    return logs.filter(l => {
      const d = new Date(l.date);
      return d >= weekRange.start && d <= weekRange.end;
    });
  }, [logs, weekRange]);

  // Agréger par jour de la semaine (0=dimanche, 6=samedi)
  const dailyCalories = useMemo(() => {
    const days = new Array(7).fill(0);
    weekLogs.forEach(l => {
      const d = new Date(l.date);
      const dayIndex = d.getDay(); // 0 = dimanche
      days[dayIndex] += l.calories;
    });
    return days;
  }, [weekLogs]);

  // Données pour le graphique
  const chartData = {
    labels: DAY_NAMES,
    datasets: [{
      label: 'Calories',
      data: dailyCalories,
      backgroundColor: dailyCalories.map(v =>
        v > targetCalories ? 'rgba(239, 68, 68, 0.6)' : 'rgba(124, 58, 237, 0.6)'
      ),
      borderColor: dailyCalories.map(v =>
        v > targetCalories ? '#ef4444' : '#7c3aed'
      ),
      borderWidth: 1,
      borderRadius: 6,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a1e',
        titleColor: '#fafafa',
        bodyColor: '#a1a1aa',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => ` ${ctx.parsed.y} kcal`
        }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#71717a', font: { size: 10 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#71717a', font: { size: 10 } } }
    }
  };

  // Résumé de la semaine — corrigé
  const totalWeekCalories = dailyCalories.reduce((sum, val) => sum + val, 0);
  const totalMaintenance = maintenance * 7; // maintenance × 7 jours
  const weekBalance = totalWeekCalories - totalMaintenance; // négatif = déficit, positif = surplus
  const estimatedWeightChange = weekBalance / 7700; // en kg (1 kg ≈ 7700 kcal)

  // Logs triés par date décroissante pour la liste
  const sortedWeekLogs = useMemo(() => {
    return [...weekLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [weekLogs]);

  const displayedLogs = sortedWeekLogs.slice(0, visibleLogs);
  const hasMoreLogs = sortedWeekLogs.length > visibleLogs;
  const isExpanded = visibleLogs > INITIAL_VISIBLE_LOGS;

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="calorie-history-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 className="section-title" style={{ margin: 0 }}>Weekly Calories</h3>
        <InfoTooltip title="Week starts on Sunday" content="Select any day to view its week (Sunday to Saturday)." />
      </div>

      <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontSize: '0.688rem', color: '#71717a', marginRight: '0.5rem' }}>Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => { setSelectedDate(e.target.value); setVisibleLogs(INITIAL_VISIBLE_LOGS); }}
            max={new Date().toISOString().split('T')[0]}
            style={{
              background: '#111113',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              color: '#fafafa',
              padding: '0.4rem 0.6rem',
              fontSize: '0.813rem',
              fontFamily: 'Inter, sans-serif'
            }}
          />
        </div>
        <div style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600 }}>
          {formatDate(weekRange.start)} – {formatDate(weekRange.end)}
        </div>
      </div>

      <div style={{ height: '200px' }}>
        {weekLogs.length > 0 ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div className="chart-empty">No data for this week</div>
        )}
      </div>

      {/* Résumé hebdomadaire — corrigé */}
      <div className="weekly-summary">
        <div className="summary-row">
          <span>Total consumed</span>
          <span className="summary-value">{totalWeekCalories} kcal</span>
        </div>
        <div className="summary-row">
          <span>Maintenance calories</span>
          <span className="summary-value">{totalMaintenance} kcal</span>
        </div>
        <div className="summary-row">
          <span>{weekBalance >= 0 ? 'Surplus' : 'Deficit'}</span>
          <span className="summary-value" style={{ color: weekBalance >= 0 ? '#ef4444' : '#22c55e' }}>
            {weekBalance >= 0 ? '+' : ''}{weekBalance} kcal
          </span>
        </div>
        <div className="summary-row">
          <span>Est. weight {weekBalance >= 0 ? 'gain' : 'loss'}</span>
          <span className="summary-value" style={{ color: weekBalance >= 0 ? '#ef4444' : '#22c55e' }}>
            {estimatedWeightChange >= 0 ? '+' : ''}{estimatedWeightChange.toFixed(2)} kg
          </span>
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        {displayedLogs.map((l, i) => (
          <div key={l.id || i} className="calorie-history-item">
            <span>{new Date(l.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <span className="calorie-history-value" style={{ color: l.calories > targetCalories ? '#ef4444' : '#22c55e' }}>
              {l.calories} kcal
            </span>
          </div>
        ))}
        {hasMoreLogs && (
          <button className="view-more-btn" onClick={() => setVisibleLogs(prev => prev + LOGS_PER_CLICK)}>
            View More ({sortedWeekLogs.length - visibleLogs} remaining)
          </button>
        )}
        {isExpanded && !hasMoreLogs && (
          <button className="view-more-btn" onClick={() => setVisibleLogs(INITIAL_VISIBLE_LOGS)}>
            View Less
          </button>
        )}
      </div>
    </div>
  );
};