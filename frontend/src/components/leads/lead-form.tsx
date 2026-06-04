'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { LEAD_STATUS, STATUS_ORDER } from '@/constants/leadStatus';
import type { Lead } from '@/constants/leadStatus';

const leadFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  phone: z.string().trim().min(7, 'Phone number too short').max(20, 'Phone number too long'),
  company: z.string().trim().max(150, 'Company name too long'),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Converted', 'Lost']),
  notes: z.string().trim().max(1000, 'Notes are too long').optional().or(z.literal('')),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  defaultValues?: Lead;
  onSubmit: (values: LeadFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function LeadForm({ defaultValues, onSubmit, isSubmitting }: LeadFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          email: defaultValues.email,
          phone: defaultValues.phone,
          company: defaultValues.company,
          status: defaultValues.status,
          notes: defaultValues.notes || '',
        }
      : {
          name: '',
          email: '',
          phone: '',
          company: '',
          status: 'New',
          notes: '',
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Full Name" placeholder="John Doe" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" placeholder="john@company.com" error={errors.email?.message} {...register('email')} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Phone" placeholder="+1 (555) 123-4567" error={errors.phone?.message} {...register('phone')} />
        <Input label="Company" placeholder="Acme Corp" error={errors.company?.message} {...register('company')} />
      </div>

      <Select
        label="Status"
        options={[
          ...STATUS_ORDER.map((s) => ({ value: s, label: s })),
        ]}
        error={errors.status?.message}
        {...register('status')}
      />

      <Textarea label="Notes" placeholder="Any additional notes..." rows={3} error={errors.notes?.message} {...register('notes')} />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {defaultValues ? 'Updating...' : 'Creating...'}
            </span>
          ) : defaultValues ? (
            'Update Lead'
          ) : (
            'Create Lead'
          )}
        </Button>
      </div>
    </form>
  );
}
