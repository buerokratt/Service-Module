import { SetStateAction, useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import './ThemeToggle.scss';

export default function ThemeToggle({ onChange }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('color-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('color-theme', theme);
    if (onChange) onChange({ target: { value: theme } });
  }, [theme, onChange]);

  useEffect(() => {
    return () => {
      document.documentElement.dataset.theme = 'light';
    };
  }, []);

  const toggleTheme = (newTheme: SetStateAction<string>) => setTheme(newTheme);

  return (
    <div className={`theme-toggle ${theme}`}>
      <div className="toggle-indicator" />
      <button className="toggle-btn light" onClick={() => toggleTheme('light')} aria-label="Switch to light mode">
        <FaSun />
      </button>
      <button className="toggle-btn dark" onClick={() => toggleTheme('dark')} aria-label="Switch to dark mode">
        <FaMoon />
      </button>
    </div>
  );
}
