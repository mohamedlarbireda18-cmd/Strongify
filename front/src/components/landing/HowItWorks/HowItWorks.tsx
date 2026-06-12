
import React from 'react';
import './HowItWorks.css';

const steps = [
  {
    number: '1',
    icon: '📅',
    title: 'Create Your Split',
    description: 'Build your ideal training schedule with custom workout days.',
    preview: (
      <div className="step-preview step-preview-small">
        <div className="step-preview-item">🏋️ Push Day</div>
        <div className="step-preview-item">🏋️ Pull Day</div>
        <div className="step-preview-item">🦵 Leg Day</div>
      </div>
    )
  },
  {
    number: '2',
    icon: '🏋️',
    title: 'Track Every Workout',
    description: 'Log sets, reps, and weights during your gym sessions.',
    preview: (
      <table className="step-preview-table">
        <thead>
          <tr><th>Exercise</th><th>Weight</th><th>Reps</th></tr>
        </thead>
        <tbody>
          <tr><td>Bench Press</td><td style={{color:'#7c3aed'}}>80kg</td><td>×8</td></tr>
          <tr><td>Squat</td><td style={{color:'#7c3aed'}}>120kg</td><td>×5</td></tr>
        </tbody>
      </table>
    )
  },
  {
    number: '3',
    icon: '📊',
    title: 'Analyze Progress',
    description: 'Review strength gains, volume progression, and consistency metrics.',
    preview: (
      <div style={{textAlign: 'center', padding: '1rem'}}>
        <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>📈</div>
        <div style={{color: '#22c55e', fontWeight: 700}}>+15.3%</div>
        <div style={{fontSize: '0.75rem', color: '#71717a'}}>Monthly Progress</div>
      </div>
    )
  }
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="how-it-works">
      <div className="section-container">
        <div className="section-header animate-on-scroll">
          <div className="section-badge">🚀 Process</div>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Start tracking your progress in minutes.
          </p>
        </div>
        
        <div className="steps-container">
          <div className="steps-line" />
          {steps.map((step, index) => (
            <div key={index} className="step-card animate-on-scroll">
              <div className="step-number">{step.number}</div>
              <div className="step-icon">{step.icon}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
              <div className="step-preview">{step.preview}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};