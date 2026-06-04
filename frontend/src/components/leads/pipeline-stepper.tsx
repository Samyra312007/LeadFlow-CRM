'use client';

import { useCallback } from 'react';
import { STATUS_ORDER } from '@/constants/leadStatus';
import type { LeadStatus } from '@/constants/leadStatus';

interface PipelineStepperProps {
  currentStatus: LeadStatus;
  onStatusChange?: (status: LeadStatus) => Promise<void>;
  readonly?: boolean;
}

const stepColors: Record<string, string> = {
  New: 'bg-primary',
  Contacted: 'bg-amber-500',
  Qualified: 'bg-emerald-500',
  Converted: 'bg-teal-500',
  Lost: 'bg-red-500',
};

const shortLabels: Record<string, string> = {
  New: 'New',
  Contacted: 'Cont.',
  Qualified: 'Qual.',
  Converted: 'Conv.',
  Lost: 'Lost',
};

export function PipelineStepper({ currentStatus, onStatusChange, readonly }: PipelineStepperProps) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);

  const handleClick = useCallback(async (status: LeadStatus) => {
    if (readonly || status === currentStatus || !onStatusChange) return;
    await onStatusChange(status);
  }, [currentStatus, onStatusChange, readonly]);

  return (
    <div className="flex items-center w-full py-1" role="group" aria-label="Pipeline status stepper">
      {STATUS_ORDER.map((status, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isFuture = idx > currentIdx;
        const clickable = idx !== currentIdx && !readonly && !!onStatusChange;

        return (
          <div key={status} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => handleClick(status)}
              className={`
                relative flex flex-col items-center gap-0.5 transition-all duration-300
                ${clickable ? 'cursor-pointer group' : 'cursor-default'}
                disabled:opacity-60 disabled:cursor-not-allowed
              `}
              title={`${status}${isCurrent ? ' (current)' : clickable ? ` — click to change` : ''}`}
              aria-label={`${status}${isCurrent ? ' (current)' : ''}`}
            >
              <span
                className={`
                  flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold
                  transition-all duration-300
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container focus-visible:ring-offset-1
                  ${isCurrent ? 'ring-2 ring-offset-1 ring-secondary-container scale-110 shadow-md' : ''}
                  ${isCompleted ? `${stepColors[status]} text-white shadow-sm` : ''}
                  ${isCurrent ? `${stepColors[status]} text-white shadow-md` : ''}
                  ${isFuture ? 'bg-surface-container-high text-on-surface-variant border border-outline-variant/40' : ''}
                  ${clickable ? 'group-hover:opacity-80 group-active:scale-90' : ''}
                `}
              >
                {isCompleted ? (
                  <span className="material-symbols-outlined text-[12px]">check</span>
                ) : (
                  idx + 1
                )}
              </span>
              <span
                className={`text-[9px] leading-tight whitespace-nowrap transition-colors duration-300 ${
                  isCurrent ? 'text-primary font-semibold' : 'text-on-surface-variant'
                }`}
              >
                {shortLabels[status]}
              </span>
            </button>
            {idx < STATUS_ORDER.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 rounded-full transition-colors duration-300 ${
                  idx < currentIdx ? 'bg-primary' : 'bg-outline-variant/30'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
