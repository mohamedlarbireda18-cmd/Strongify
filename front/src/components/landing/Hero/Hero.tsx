import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="home" className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-icon">⚡</span>
            Smart Training Platform
          </div>
          
          <h1 className="hero-title">
            Track Your Strength.<br />
            Build Your <span className="hero-title-gradient">Physique.</span>
          </h1>
          
          <p className="hero-subtitle">
            Create custom workout splits, track every lift, monitor progression, 
            and optimize your training with powerful analytics.
          </p>
          
          <div className="hero-cta">
            <button className="btn-hero-primary" onClick={() => navigate('/login')}>
              Start Training
              <span>→</span>
            </button>
            <button className="btn-hero-secondary">
              ▶ View Demo
            </button>
          </div>
          
          <div className="hero-social-proof">
            <div className="hero-avatars">
              {['A', 'B', 'C', 'D', 'E'].map((letter, i) => (
                <div key={i} className="hero-avatar">{letter}</div>
              ))}
            </div>
            <div>
              <div className="hero-rating">
                <span className="hero-stars">★★★★★</span>
                <span className="hero-rating-text">4.9/5</span>
              </div>
              <p className="hero-stats">Trusted by 25,000+ athletes</p>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-glow" />
          
          <div className="hero-dashboard">
            <div className="hero-dashboard-main">
              <div className="hero-dashboard-header">
                <span className="hero-dashboard-title">📊 Workout Analytics</span>
                <span className="hero-dashboard-date">This Week</span>
              </div>
              
              <div className="hero-dashboard-stats">
                <div className="hero-stat-card">
                  <div className="hero-stat-label">Total Volume</div>
                  <div className="hero-stat-value">12,450<span style={{fontSize: '0.875rem'}}>kg</span></div>
                  <div className="hero-stat-change positive">↑ 12.5%</div>
                </div>
                <div className="hero-stat-card">
                  <div className="hero-stat-label">Workouts</div>
                  <div className="hero-stat-value purple">5</div>
                  <div className="hero-stat-change positive">↑ 2 this week</div>
                </div>
                <div className="hero-stat-card">
                  <div className="hero-stat-label">Current Streak</div>
                  <div className="hero-stat-value">12<span style={{fontSize: '0.875rem'}}>days</span></div>
                  <div className="hero-stat-change positive">🔥 On Fire</div>
                </div>
                <div className="hero-stat-card">
                  <div className="hero-stat-label">New PRs</div>
                  <div className="hero-stat-value purple">3</div>
                  <div className="hero-stat-change positive">🏆 Records</div>
                </div>
              </div>
              
              <div className="hero-chart">
                {[60, 75, 55, 80, 90, 70, 95].map((height, i) => (
                  <div key={i} className="hero-chart-bar" style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
            
            <div className="hero-dashboard-float hero-float-1">
              <div style={{fontSize: '0.75rem', color: '#71717a', marginBottom: '0.25rem'}}>
                Latest PR
              </div>
              <div style={{fontWeight: 700, fontSize: '1.125rem', color: '#fafafa'}}>
                Bench Press
              </div>
              <div style={{color: '#7c3aed', fontWeight: 700}}>
                100kg × 5
              </div>
            </div>
            
            <div className="hero-dashboard-float hero-float-2">
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span>🔥</span>
                <div>
                  <div style={{fontWeight: 600, fontSize: '0.875rem', color: '#fafafa'}}>12 Day Streak</div>
                  <div style={{fontSize: '0.75rem', color: '#71717a'}}>
                    Keep it going!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};