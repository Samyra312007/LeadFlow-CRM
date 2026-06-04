import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-label-sm text-on-surface-variant font-medium">{label}</label>
      )}
      <select
        ref={ref}
        className={`w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container focus:border-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all appearance-none ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-label-sm text-error">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';
