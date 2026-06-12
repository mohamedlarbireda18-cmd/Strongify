
import React from 'react';
import './Features.css';

const featuresList = [
  {
    icon: '📋',
    title: 'Workout Tracking',
    description: 'Track sets, reps, weights, and workout duration effortlessly with our intuitive logger.'
  },
  {
    icon: '📅',
    title: 'Custom Workout Splits',
    description: 'Build personalized Push Pull Legs or custom routines that match your goals.'
  },
  {
    icon: '📈',
    title: 'Progress Analytics',
    description: 'Visualize strength gains and bodyweight progression with beautiful charts.'
  },
  {
    icon: '📚',
    title: 'Exercise Library',
    description: 'Access hundreds of exercises with smart filters and detailed instructions.'
  },
  {
    icon: '🏆',
    title: 'Personal Records',
    description: 'Automatically detect new PRs and celebrate every milestone in your journey.'
  },
  {
    icon: '🔥',
    title: 'Daily Streaks',
    description: 'Stay consistent with streak tracking that keeps you motivated and accountable.'
  }
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="features">
      <div className="section-container">
        <div className="section-header animate-on-scroll">
          <div className="section-badge">✨ Features</div>
          <h2 className="section-title">Everything You Need To Progress</h2>
          <p className="section-subtitle">
            Powerful tools designed for athletes who train with purpose.
          </p>
        </div>
        
        <div className="features-grid">
          {featuresList.map((feature, index) => (
            <div key={index} className="feature-card animate-on-scroll">
              <div className="feature-card-icon">{feature.icon}</div>
              <h3 className="feature-card-title">{feature.title}</h3>
              <p className="feature-card-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
