import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface WeightChartProps {
  data: { date: string; weight: number }[];
}

const PERIODS = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '1Y', days: 365 },
  { label: 'All', days: 9999 }
];

export const WeightChart: React.FC<WeightChartProps> = ({ data }) => {
  const [period, setPeriod] = React.useState(30);

  const filtered = data.slice(-Math.min(period, data.length));

  const chartData = {
    labels: filtered.map(d => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [{
      label: 'Weight (kg)',
      data: filtered.map(d => d.weight),
      borderColor: '#a78bfa',
      backgroundColor: 'rgba(124, 58, 237, 0.1)',
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: '#a78bfa',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      tension: 0.3,
      fill: true
    }]
  };

  const options = {
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
          label: (ctx: any) => ` ${ctx.parsed.y} kg`
        }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#71717a', font: { size: 10 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#71717a', font: { size: 10 } } }
    }
  };

  return (
    <div className="weight-chart-container">
      <div className="chart-header">
        <h3>Weight Progress</h3>
        <div className="period-selector">
          {PERIODS.map(p => (
            <button
              key={p.label}
              className={`period-btn ${period === p.days ? 'active' : ''}`}
              onClick={() => setPeriod(p.days)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: 200 }}>
        {data.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="chart-empty">No weight data yet</div>
        )}
      </div>
    </div>
  );
};