
import { useState, useEffect } from 'react';

const THEME_STORAGE_KEY = 'strongify-theme';

type Theme = 'dark' | 'light';

const getInitialTheme = (): Theme => {
  // 1. Vérifier le localStorage
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }
  
  // 2. Vérifier la préférence système
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  
  // 3. Par défaut : dark mode
  return 'dark';
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Appliquer le thème et sauvegarder
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'light') {
      document.body.classList.add('light-mode');
      root.setAttribute('data-theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      root.setAttribute('data-theme', 'dark');
    }
    
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Écouter les changements de préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      // Ne changer automatiquement que si l'utilisateur n'a pas fait de choix explicite
      if (!storedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');

  return { 
    theme, 
    toggleTheme, 
    setLightTheme, 
    setDarkTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };
};
