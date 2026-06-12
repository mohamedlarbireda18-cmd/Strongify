import React, { useEffect, useState, useRef } from 'react';

interface StatsCardsProps {
  streak: number;
  currentWeight: number | null;
  totalSessions: number;
  period: string;
  onPeriodChange: (period: string) => void;
}

const periodLabels: Record<string, string> = {
  week: 'This Week',
  '15days': 'Last 15 Days',
  month: 'This Month',
};

export const StatsCards: React.FC<StatsCardsProps> = ({
  streak,
  currentWeight,
  totalSessions,
  period,
  onPeriodChange,
}) => {
  const [visible, setVisible] = useState(false);
  const [pulseEnded, setPulseEnded] = useState(false);
  const [animatedStreak, setAnimatedStreak] = useState(0);
  const [animatedWeight, setAnimatedWeight] = useState(0);
  const [animatedSessions, setAnimatedSessions] = useState(0);
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    const pulseTimer = setTimeout(() => setPulseEnded(true), 3500);
    return () => {
      clearTimeout(timer);
      clearTimeout(pulseTimer);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const duration = 800;
    const steps = 20;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedStreak(Math.round(streak * eased));
      setAnimatedWeight(Number((currentWeight ? currentWeight * eased : 0).toFixed(1)));
      setAnimatedSessions(Math.round(totalSessions * eased));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [visible, streak, currentWeight, totalSessions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowPeriodMenu(false);
      }
    };
    if (showPeriodMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPeriodMenu]);

  const isStreakActive = streak > 0;
  const isStreakFire = streak >= 7;
  const isWeightActive = currentWeight !== null && currentWeight > 0;
  const isSessionsActive = totalSessions > 0;

  const cards = [
    {
      icon: '🔥',
      label: 'Current Streak',
      value: animatedStreak,
      suffix: ` day${animatedStreak !== 1 ? 's' : ''}`,
      color: '#f59e0b',
      badge: isStreakFire ? 'ON FIRE' : undefined,
      specialClass: isStreakActive ? (isStreakFire ? 'streak-fire' : 'streak-active') : '',
      pulseClass: !pulseEnded && isStreakActive ? 'pulse-once' : '',
      sparkline: [2, 3, 5, 4, 7, 6, 8, streak].filter(v => !isNaN(v) && v > 0).slice(-8),
      extra: null,
    },
    {
      icon: '⚖️',
      label: 'Current Weight',
      value: animatedWeight > 0 ? animatedWeight : null,
      suffix: ' kg',
      color: '#22c55e',
      specialClass: isWeightActive ? 'weight-active' : '',
      pulseClass: !pulseEnded && isWeightActive ? 'pulse-once' : '',
      sparkline: [74, 74.5, 75, 74.8, 75.2, 75, 75.5, currentWeight || 0].filter(w => w > 0).slice(-8),
      extra: null,
    },
    {
      icon: '🏋️',
      label: 'Sessions',
      value: animatedSessions,
      suffix: '',
      color: '#7c3aed',
      specialClass: isSessionsActive ? 'sessions-active' : '',
      pulseClass: !pulseEnded && isSessionsActive ? 'pulse-once' : '',
      sparkline: [0, 1, 1, 2, 2, 3, 4, totalSessions].filter(v => !isNaN(v)).slice(-8),
      extra: (
        <div className="period-selector-card" ref={menuRef}>
          <button
            className="period-icon-btn"
            onClick={() => setShowPeriodMenu(!showPeriodMenu)}
          >
            ⚙️
          </button>
          {showPeriodMenu && (
            <div className="period-dropdown">
              {Object.entries(periodLabels).map(([key, label]) => (
                <button
                  key={key}
                  className={`period-option ${period === key ? 'active' : ''}`}
                  onClick={() => {
                    onPeriodChange(key);
                    setShowPeriodMenu(false);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data, 1);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 100;
    const height = 24;
    const padding = 2;
    const points = data.map((val, i) => ({
      x: padding + (i / (data.length - 1)) * (width - padding * 2),
      y: height - padding - ((val - min) / range) * (height - padding * 2),
    }));
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    return (
      <svg className="stat-card-sparkline" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      </svg>
    );
  };

  return (
    <div className="stats-cards">
      {cards.map((card, index) => (
        <div
          key={index}
          ref={(el) => { cardRefs.current[index] = el; }}
          className={['stat-card', visible ? 'visible' : '', card.specialClass, card.pulseClass].filter(Boolean).join(' ')}
        >
          <div className="stat-card-icon" style={{ background: `${card.color}20` }}>
            <span>{card.icon}</span>
            {card.badge && <span className="stat-card-badge">{card.badge}</span>}
          </div>
          <div className="stat-card-info">
            <span className="stat-card-value">
              {card.value !== null ? `${card.value}${card.suffix}` : '-- kg'}
            </span>
            <span className="stat-card-label">
              {index === 2 ? periodLabels[period] : card.label}
            </span>
          </div>
          {index === 2 && card.extra}
          <Sparkline data={card.sparkline} color={card.color} />
        </div>
      ))}
    </div>
  );
};