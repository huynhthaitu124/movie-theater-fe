import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text', 
    label, 
    error, 
    helperText, 
    fullWidth = true, 
    leftIcon, 
    rightIcon, 
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    return (
      <div className={cn(fullWidth && 'w-full', 'mb-4')}>
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              'input',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-error-500 focus:border-error-500 focus:ring-error-500',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-error-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;