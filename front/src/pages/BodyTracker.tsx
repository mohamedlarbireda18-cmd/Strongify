import React, { useState } from 'react';
import { useBody } from '../hooks/useBody';
import { BodyOnboarding } from '../components/body/BodyOnboarding';
import { BodyDashboard } from '../components/body/BodyDashboard';
import '../components/body/Body.css';

export const BodyTracker: React.FC = () => {
  const body = useBody();
  const [showOnboarding, setShowOnboarding] = useState(false);

  if (body.isLoading) {
    return (
      <div className="body-page">
        <div className="skeleton" style={{ height: 32, width: '40%', marginBottom: 20 }} />
        <div className="body-cards">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      </div>
    );
  }

  // Première visite : pas de goals → onboarding automatique
  if (!body.userGoals && !showOnboarding) {
    return (
      <div className="body-page">
        <BodyOnboarding
          onComplete={(data) => {
            body.saveGoals({
              goal: data.goal,
              activity: data.activity,
              height: data.height,
              age: data.age,
              gender: data.gender,
              targetWeight: data.targetWeight
            });
            body.addWeight(data.weight);
            setShowOnboarding(false);
          }}
          onSkip={() => setShowOnboarding(false)}
        />
      </div>
    );
  }

  return (
    <div className="body-page">
      <BodyDashboard body={body} onEditPlan={() => setShowOnboarding(true)} />

      {/* Modal pour modifier le plan */}
      {showOnboarding && (
        <div className="modal-overlay" onClick={() => setShowOnboarding(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 500, maxHeight: '90vh', overflow: 'auto', position: 'relative' }}
          >
            <button
              onClick={() => setShowOnboarding(false)}
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'none', border: 'none',
                color: '#a1a1aa', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10
              }}
            >
              ×
            </button>
            <BodyOnboarding
              onComplete={(data) => {
                body.saveGoals({
                  goal: data.goal,
                  activity: data.activity,
                  height: data.height,
                  age: data.age,
                  gender: data.gender,
                  targetWeight: data.targetWeight
                });
                setShowOnboarding(false);
              }}
              onSkip={() => setShowOnboarding(false)}
              initialData={body.userGoals}
            />
          </div>
        </div>
      )}
    </div>
  );
};