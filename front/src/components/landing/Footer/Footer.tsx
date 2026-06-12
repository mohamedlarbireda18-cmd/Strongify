
import React from 'react';
import './Footer.css';

const footerLinks = {
  Product: ['Features', 'How It Works', 'Pricing', 'Changelog'],
  Resources: ['Documentation', 'API', 'Blog', 'Community'],
  Support: ['Help Center', 'Contact', 'Status', 'Security']
};

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            <span>💪</span>
            <span>STRONGIFY</span>
          </div>
          <p className="footer-description">
            Built for athletes who train with purpose.
            Track, analyze, and optimize your strength training journey.
          </p>
        </div>
        
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="footer-column-title">{title}</h4>
            <ul className="footer-links">
              {links.map(link => (
                <li key={link}>
                  <span className="footer-link">{link}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="footer-bottom">
        <p className="footer-copyright">
          © 2026 Strongify. Built for athletes who train with purpose.
        </p>
        <div className="footer-social">
          {['𝕏', '⬡', '▶', '📷'].map((icon, i) => (
            <span key={i} className="footer-social-link">{icon}</span>
          ))}
        </div>
      </div>
    </footer>
  );
};
