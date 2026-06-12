import React, { useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

interface ProgressPoint {
  date: string;
  volume: number;
  maxWeight: number;
}

interface ProgressChartProps {
  data: ProgressPoint[];
  sessions: number;
  onSessionsChange: (nb: number) => void;
}

const periods = [3, 5, 10, 15];

export const ProgressChart: React.FC<ProgressChartProps> = ({ data, sessions, onSessionsChange }) => {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const labels = data.map((_, i) => `S${i + 1}`);
  const volumes = data.map(p => p.volume);
  const maxWeights = data.map(p => p.maxWeight);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Total Volume (kg)',
        data: volumes,
        backgroundColor: 'rgba(124, 58, 237, 0.6)',
        borderColor: '#7c3aed',
        borderWidth: 2,
        borderRadius: 6,
        tension: 0.3,
        order: 2,
        yAxisID: 'y'
      },
      {
        label: 'Max Weight (kg)',
        data: maxWeights,
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: '#22c55e',
        borderWidth: 2,
        borderRadius: 6,
        tension: 0.3,
        order: 2,
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#a1a1aa', padding: 16, usePointStyle: true, font: { size: 11 } }
      },
      tooltip: {
        backgroundColor: '#1a1a1e',
        titleColor: '#fafafa',
        bodyColor: '#a1a1aa',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: (items: any) => `Session ${items[0].dataIndex + 1}`,
          label: (context: any) => ` ${context.dataset.label}: ${context.parsed.y} kg`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#71717a', font: { size: 10 } }
      },
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#a78bfa', font: { size: 10 }, callback: (v: any) => `${v}` },
        title: { display: true, text: 'Volume (kg)', color: '#a78bfa' }
      },
      y1: {
        type: 'linear' as const,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        ticks: { color: '#22c55e', font: { size: 10 }, callback: (v: any) => `${v}` },
        title: { display: true, text: 'Max Weight (kg)', color: '#22c55e' }
      }
    }
  };

  return (
    <div className="progress-chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Session Progress</h3>
        <div className="chart-toggle">
          <button className={`toggle-btn ${chartType === 'bar' ? 'active' : ''}`} onClick={() => setChartType('bar')}>▊</button>
          <button className={`toggle-btn ${chartType === 'line' ? 'active' : ''}`} onClick={() => setChartType('line')}>∿</button>
        </div>
      </div>

      <div className="period-selector">
        {periods.map(p => (
          <button key={p} className={`period-btn ${sessions === p ? 'active' : ''}`} onClick={() => onSessionsChange(p)}>
            {p} sessions
          </button>
        ))}
      </div>

      <div className="chart-wrapper">
        {data.length === 0 ? (
          <div className="chart-empty">
            <span>📊</span>
            <p>No session data yet</p>
          </div>
        ) : chartType === 'bar' ? (
          <Bar data={chartData} options={options} />
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};