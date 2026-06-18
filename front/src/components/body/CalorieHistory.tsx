import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { InfoTooltip } from '../ui/InfoTooltip';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props { logs: { calories: number; date: string }[]; targetCalories: number; }

const INITIAL_VISIBLE = 5;
const LOAD_MORE = 5;

export const CalorieHistory: React.FC<Props> = ({ logs, targetCalories }) => {
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE);

  // Filtrer les logs : du endDate-9 jours jusqu'à endDate
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - 9);
  start.setHours(0, 0, 0, 0);

  const filteredLogs = logs.filter(l => {
    const d = new Date(l.date);
    return d >= start && d <= end;
  });

  // Agréger par jour pour le graphique
  const dailyMap: Record<string, number> = {};
  filteredLogs.forEach(l => {
    const day = new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dailyMap[day] = (dailyMap[day] || 0) + l.calories;
  });

  const labels = Object.keys(dailyMap);
  const values = Object.values(dailyMap);

  const data = {
    labels,
    datasets: [{
      label: 'Calories',
      data: values,
      backgroundColor: values.map(v => v > targetCalories ? 'rgba(239, 68, 68, 0.6)' : 'rgba(124, 58, 237, 0.6)'),
      borderColor: values.map(v => v > targetCalories ? '#ef4444' : '#7c3aed'),
      borderWidth: 1,
      borderRadius: 6,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a1e', titleColor: '#fafafa', bodyColor: '#a1a1aa',
        borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, padding: 12, cornerRadius: 8,
        callbacks: { label: (c: any) => ` ${c.parsed.y} kcal` }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#71717a', font: { size: 10 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#71717a', font: { size: 10 } } }
    }
  };

  // Logs triés par date décroissante pour la liste
  const sortedLogs = [...filteredLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const displayedLogs = sortedLogs.slice(0, visibleCount);
  const hasMore = sortedLogs.length > visibleCount;
  const isExpanded = visibleCount > INITIAL_VISIBLE;

  const handleViewMore = () => setVisibleCount(prev => prev + LOAD_MORE);
  const handleViewLess = () => setVisibleCount(INITIAL_VISIBLE);

  return (
    <div className="calorie-history-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 className="section-title" style={{ margin: 0 }}>Calorie History</h3>
        <InfoTooltip title="Calorie History" content="Shows the last 10 days ending on the selected date. Use the date picker to change the range." />
      </div>

      {/* Sélecteur de date */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ fontSize: '0.688rem', color: '#71717a', marginRight: '0.5rem' }}>End date:</label>
        <input
          type="date"
          value={endDate}
          onChange={e => { setEndDate(e.target.value); setVisibleCount(INITIAL_VISIBLE); }}
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

      <div style={{ height: '200px' }}>
        {filteredLogs.length > 0 ? (
          <Bar data={data} options={options} />
        ) : (
          <div className="chart-empty">No data for this period</div>
        )}
      </div>

      {/* Liste des logs avec View More / View Less */}
      <div style={{ marginTop: '1rem' }}>
        {displayedLogs.map((l, i) => (
          <div key={i} className="calorie-history-item">
            <span>{new Date(l.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <span className="calorie-history-value" style={{ color: l.calories > targetCalories ? '#ef4444' : '#22c55e' }}>
              {l.calories} kcal
            </span>
          </div>
        ))}
        {hasMore && (
          <button className="view-more-btn" onClick={handleViewMore}>
            View More ({sortedLogs.length - visibleCount} remaining)
          </button>
        )}
        {isExpanded && !hasMore && (
          <button className="view-more-btn" onClick={handleViewLess}>
            View Less
          </button>
        )}
      </div>
    </div>
  );
};