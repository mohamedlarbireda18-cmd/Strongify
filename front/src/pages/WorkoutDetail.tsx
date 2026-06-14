import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkoutDetail } from '../hooks/useWorkoutDetail';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const SESSION_OPTIONS = [3, 5, 10, 15];
const INITIAL_VISIBLE_SESSIONS = 10;

const muscleColors: Record<string, string> = {
  Chest: '#ef4444',
  Back: '#3b82f6',
  Shoulders: '#f59e0b',
  Biceps: '#22c55e',
  Triceps: '#8b5cf6',
  Quadriceps: '#ec4899',
  Hamstrings: '#14b8a6',
  Glutes: '#f97316',
  Calves: '#6366f1',
  Abs: '#84cc16',
};

export const WorkoutDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    workout,
    progress,
    progressSessions,
    setProgressSessions,
    isLoading,
  } = useWorkoutDetail(id!);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [expanded, setExpanded] = useState(false);

  if (isLoading)
    return (
      <div className="workouts-page">
        <div className="skeleton" style={{ height: 200, borderRadius: 14, marginBottom: 16 }} />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton" style={{ height: 48, borderRadius: 10, marginBottom: 8 }} />
        ))}
      </div>
    );

  if (!workout)
    return (
      <div className="workouts-page">
        <p style={{ color: '#ef4444' }}>Workout not found</p>
      </div>
    );

  const recentSessions = workout.sessions.slice(-progressSessions);
  const volumeData = recentSessions.map((s) => s.totalVolume);
  const sessionLabels = recentSessions.map((_, i) => `S${i + 1}`);

  const mainChartData = {
    labels: sessionLabels,
    datasets: [
      {
        label: 'Total Volume (kg)',
        data: volumeData,
        backgroundColor: 'rgba(124, 58, 237, 0.6)',
        borderColor: '#7c3aed',
        borderWidth: 2,
        borderRadius: chartType === 'bar' ? 6 : undefined,
        tension: 0.3,
        fill: false,
        pointRadius: chartType === 'line' ? 4 : 0,
        pointBackgroundColor: '#7c3aed',
      },
    ],
  };

  const mainChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#a1a1aa' }, grid: { color: 'rgba(255,255,255,0.08)' } },
      y: { ticks: { color: '#a1a1aa' }, grid: { color: 'rgba(255,255,255,0.08)' } },
    },
  };

  const reversedSessions = [...workout.sessions].reverse();
  const displayedSessions = expanded ? reversedSessions : reversedSessions.slice(0, INITIAL_VISIBLE_SESSIONS);
  const hasMoreSessions = reversedSessions.length > INITIAL_VISIBLE_SESSIONS;

  const exerciseData = selectedExercise ? progress.find((p) => p.name === selectedExercise) : null;

  const exerciseChartData = exerciseData
    ? {
        labels: exerciseData.data.map((_, i) => `S${i + 1}`),
        datasets: [
          {
            label: 'Volume (kg)',
            data: exerciseData.data.map((d) => d.volume),
            backgroundColor: 'rgba(124, 58, 237, 0.6)',
            borderColor: '#7c3aed',
            borderWidth: 1,
            borderRadius: 6,
            yAxisID: 'y',
          },
          {
            label: 'Max Weight (kg)',
            data: exerciseData.data.map((d) => d.maxWeight),
            backgroundColor: 'rgba(34, 197, 94, 0.6)',
            borderColor: '#22c55e',
            borderWidth: 1,
            borderRadius: 6,
            yAxisID: 'y1',
          },
        ],
      }
    : null;

  const exerciseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: '#a1a1aa', padding: 16, usePointStyle: true } },
      tooltip: {
        backgroundColor: '#1a1a1e',
        titleColor: '#fafafa',
        bodyColor: '#a1a1aa',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: '#71717a', font: { size: 10 } } },
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        grid: { color: 'rgba(255,255,255,0.08)' },
        ticks: { color: '#a78bfa', font: { size: 10 } },
        title: { display: true, text: 'Volume (kg)', color: '#a78bfa' },
      },
      y1: {
        type: 'linear' as const,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        ticks: { color: '#22c55e', font: { size: 10 } },
        title: { display: true, text: 'Max Weight (kg)', color: '#22c55e' },
      },
    },
  };

  return (
    <div className="workout-detail-page">
      <button className="back-btn" onClick={() => navigate('/my-workouts')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Back
      </button>

      <h1 className="workout-detail-name">{workout.name}</h1>
      <span className={`workout-detail-type type-${workout.type}`}>{workout.type.replace('_', ' ')}</span>

      {volumeData.length > 0 && (
        <div className="chart-container" style={{ margin: '1.5rem 0' }}>
          <div className="chart-header">
            <h3 className="chart-title">Total Volume Progression</h3>
            <div className="chart-toggle">
              <button className={`toggle-btn ${chartType === 'bar' ? 'active' : ''}`} onClick={() => setChartType('bar')}>▊</button>
              <button className={`toggle-btn ${chartType === 'line' ? 'active' : ''}`} onClick={() => setChartType('line')}>∿</button>
            </div>
          </div>
          <div style={{ height: '220px' }} key={chartType}>
            {chartType === 'bar' ? <Bar data={mainChartData} options={mainChartOptions} /> : <Line data={mainChartData} options={mainChartOptions} />}
          </div>
        </div>
      )}

      <div className="workout-detail-section">
        <h3>Progress period</h3>
        <div className="period-selector">
          {SESSION_OPTIONS.map((num) => (
            <button key={num} className={`period-btn ${progressSessions === num ? 'active' : ''}`} onClick={() => setProgressSessions(num)}>
              {num} sessions
            </button>
          ))}
        </div>
      </div>

      <div className="workout-detail-section">
        <h3>Exercises</h3>
        {workout.exercises.map((ex) => {
          const exProgress = progress.find((p) => p.name === ex.exercise.name);
          const hasData = exProgress && exProgress.data.length > 0;
          const muscleColor = muscleColors[ex.exercise.muscleGroup] || '#71717a';
          return (
            <div
              key={ex.exerciseId}
              className="detail-exercise-item"
              onClick={(e) => {
                if (hasData) {
                  e.stopPropagation();
                  setSelectedExercise(ex.exercise.name);
                }
              }}
              style={{ cursor: hasData ? 'pointer' : 'default' }}
            >
              <div className="exercise-info">
                <span className="exercise-name">{ex.exercise.name}</span>
                <span className="exercise-muscle" style={{ color: muscleColor, background: `${muscleColor}20` }}>
                  {ex.exercise.muscleGroup}
                </span>
              </div>
              {hasData && (
                <div className="mini-chart">
                  {exProgress.data.map((point, i) => {
                    const maxVolume = Math.max(...exProgress.data.map((d) => d.volume));
                    const heightPercent = maxVolume > 0 ? (point.volume / maxVolume) * 100 : 0;
                    return (
                      <div
                        key={i}
                        className="mini-bar"
                        style={{ height: `${heightPercent}%`, width: `${100 / exProgress.data.length - 4}%` }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="workout-detail-section">
        <h3>Sessions ({workout.sessions.length})</h3>
        {displayedSessions.map((s) => (
          <div key={s.id} className="detail-session-item" onClick={() => navigate(`/my-workouts/${id}/session/${s.id}`)}>
            <span>{new Date(s.date).toLocaleDateString()}</span>
            <span className="detail-session-volume">{s.totalVolume} kg</span>
          </div>
        ))}
        {hasMoreSessions && (
          <button className="view-more-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Show Less' : `View More (${reversedSessions.length - INITIAL_VISIBLE_SESSIONS} remaining)`}
          </button>
        )}
      </div>

      <button className="start-session-btn" onClick={() => navigate(`/my-workouts/${id}/session`)}>
        Start New Session
      </button>

      {selectedExercise && exerciseChartData && (
        <div className="modal-overlay" onClick={() => setSelectedExercise(null)}>
          <div className="modal-content" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setSelectedExercise(null)}
              style={{ position: 'absolute', top: 12, right: 16 }}
            >
              ×
            </button>
            <h3 className="modal-title">{selectedExercise} Progression</h3>
            <div style={{ height: '300px', marginTop: '1rem' }}>
              <Bar data={exerciseChartData} options={exerciseChartOptions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};