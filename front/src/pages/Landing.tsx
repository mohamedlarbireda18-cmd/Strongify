
import React, { useEffect } from 'react';
import { Navbar } from '../components/landing/Navbar/Navbar';
import { Hero } from '../components/landing/Hero/Hero';
import { Features } from '../components/landing/Features/Features';
import { HowItWorks } from '../components/landing/HowItWorks/HowItWorks';
import { Contact } from '../components/landing/Contact/Contact';
import { FinalCTA } from '../components/landing/CTA/FinalCTA';
import { Footer } from '../components/landing/Footer/Footer';
import { useTheme } from '../hooks/useTheme';
import '../styles/global.css';

export const Landing: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  // Animation au scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">
      <Navbar theme={theme} onThemeToggle={toggleTheme} />
      <Hero />
      <Features />
      <HowItWorks />
      <Contact />
      <FinalCTA />
      <Footer />
    </div>
  );
};
