'use client';

import { Dialog } from '@/components/ui/dialog';
import { LeadForm } from './lead-form';
import type { Lead, LeadFormData } from '@/constants/leadStatus';

interface LeadModalProps {
  open: boolean;
  onClose: () => void;
  lead?: Lead | null;
  onSubmit: (values: LeadFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function LeadModal({ open, onClose, lead, onSubmit, isSubmitting }: LeadModalProps) {
  const isEdit = !!lead;

  return (
    <Dialog open={open} onClose={onClose} title={isEdit ? 'Edit Lead' : 'New Lead'}>
      <LeadForm
        key={lead?._id ?? 'new'}
        defaultValues={lead ?? undefined}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    </Dialog>
  );
}
