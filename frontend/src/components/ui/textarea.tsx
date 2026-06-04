import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-label-sm text-on-surface-variant font-medium">{label}</label>
      )}
      <textarea
        ref={ref}
        className={`w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary-container focus:border-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none ${className}`}
        {...props}
      />
      {error && <p className="text-label-sm text-error">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';
