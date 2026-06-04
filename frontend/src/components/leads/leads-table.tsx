'use client';

import { format } from 'date-fns';
import { StatusBadge } from '@/components/leads/status-badge';
import { PipelineStepper } from '@/components/leads/pipeline-stepper';
import type { Lead, LeadStatus } from '@/constants/leadStatus';

interface LeadsTableProps {
  leads: Lead[] | undefined;
  isLoading: boolean;
  isError?: boolean;
  sort: string;
  onSort: (field: string) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onStatusChange?: (id: string, status: LeadStatus) => Promise<void>;
}

export function LeadsTable({ leads, isLoading, isError, sort, onSort, onEdit, onDelete, onStatusChange }: LeadsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-surface-container-low rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="material-symbols-outlined text-6xl text-error mb-4">cloud_off</span>
        <p className="font-headline-sm text-headline-sm text-on-surface mb-1">Failed to load leads</p>
        <p className="text-body-md text-on-surface-variant">The server may be offline. Try again later.</p>
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">group_off</span>
        <p className="font-headline-sm text-headline-sm text-on-surface mb-1">No leads yet</p>
        <p className="text-body-md text-on-surface-variant">Create your first lead to get started.</p>
      </div>
    );
  }

  const getSortIcon = (field: string) => {
    if (sort === field) return 'arrow_upward';
    if (sort === `-${field}`) return 'arrow_downward';
    return 'unfold_more';
  };

  const handleSort = (field: string) => {
    if (sort === field) onSort(`-${field}`);
    else if (sort === `-${field}`) onSort('-createdAt');
    else onSort(field);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
      <table className="w-full">
        <thead>
          <tr className="bg-surface-container-low">
            {[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'company', label: 'Company' },
              { key: 'status', label: 'Status' },
              { key: 'createdAt', label: 'Created' },
            ].map(({ key, label }) => (
              <th
                key={key}
                className="px-4 py-3.5 text-left cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary-container"
                onClick={() => handleSort(key)}
              >
                <span className="flex items-center gap-1 text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                  {label}
                  <span className="material-symbols-outlined text-[16px] text-outline-variant group-hover:text-on-surface transition-colors">
                    {getSortIcon(key)}
                  </span>
                </span>
              </th>
            ))}
            <th className="px-4 py-3.5 text-right text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead._id} className="border-t border-outline-variant/20 hover:bg-surface-container-low transition-colors">
              <td className="px-4 py-3.5">
                <p className="font-body-md text-body-md text-primary font-medium">{lead.name}</p>
              </td>
              <td className="px-4 py-3.5">
                <p className="font-body-sm text-body-sm text-on-surface-variant">{lead.email}</p>
              </td>
              <td className="px-4 py-3.5">
                <p className="font-body-sm text-body-sm text-on-surface">{lead.company}</p>
              </td>
              <td className="px-4 py-3.5 min-w-[180px]">
                <div className="flex items-center gap-2">
                  <StatusBadge status={lead.status} />
                  <div className="flex-1 max-w-[200px]">
                    <PipelineStepper
                      currentStatus={lead.status}
                      onStatusChange={onStatusChange ? (s) => onStatusChange(lead._id, s) : undefined}
                    />
                  </div>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                </p>
              </td>
              <td className="px-4 py-3.5 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEdit(lead)}
                    className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
                    title="Edit"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(lead)}
                    className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
                    title="Delete"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
