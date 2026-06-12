
import React from 'react';
import './FinalCTA.css';

export const FinalCTA: React.FC = () => {
  return (
    <section className="final-cta">
      <div className="final-cta-content animate-on-scroll">
        <h2 className="final-cta-title">Start Tracking Smarter.</h2>
        <p className="final-cta-subtitle">
          Join thousands of athletes building strength with data-driven training.
        </p>
        <div className="final-cta-actions">
          <button className="btn-cta-primary">
            Create Free Account
            <span>→</span>
          </button>
          <button className="btn-cta-secondary">
            ▶ Watch Demo
          </button>
        </div>
      </div>
    </section>
  );
};
