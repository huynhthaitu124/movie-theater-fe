import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../utils/cn';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'p-2 rounded-full transition-colors duration-200',
        'bg-secondary-200 dark:bg-secondary-700',
        'hover:bg-secondary-300 dark:hover:bg-secondary-600',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        className
      )}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun size={20} className="text-secondary-100" />
      ) : (
        <Moon size={20} className="text-secondary-800" />
      )}
    </button>
  );
};

export default ThemeToggle;