import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-label-sm text-on-surface-variant font-medium">{label}</label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary-container focus:border-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all ${className}`}
        {...props}
      />
      {error && <p className="text-label-sm text-error">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';
