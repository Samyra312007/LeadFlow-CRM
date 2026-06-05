'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/dialog';
import { useGetDeals, useCreateDeal, useUpdateDeal, useUpdateDealStage, useDeleteDeal, useGetDealStats } from '@/hooks/useDeals';
import { useGetContacts } from '@/hooks/useContacts';
import { DEAL_STAGES, STAGE_COLORS } from '@/constants/leadStatus';
import type { Deal, DealStage } from '@/constants/leadStatus';

const dealFormSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters'),
  value: z.string().trim().min(1, 'Value is required').refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Value must be a positive number'),
  stage: z.enum(['Qualification', 'Demo', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] as const),
  contact: z.string().min(1, 'Please select a contact'),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
  expectedCloseDate: z.string().min(1, 'Expected close date is required'),
});

interface DealFormValues {
  title: string;
  value: string;
  stage: 'Qualification' | 'Demo' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  contact: string;
  notes?: string;
  expectedCloseDate: string;
}

export default function DealsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null);

  const { data, isLoading, isError } = useGetDeals({ limit: 100 });
  const { data: statsRes } = useGetDealStats();
  const { data: contactsRes } = useGetContacts({ limit: 100 });
  const createMutation = useCreateDeal();
  const updateMutation = useUpdateDeal();
  const updateStageMutation = useUpdateDealStage();
  const deleteMutation = useDeleteDeal();

  const deals = data?.data || [];
  const contacts = contactsRes?.data || [];
  const stats = statsRes?.data;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
  });

  const getContactId = (deal: Deal): string => {
    if (typeof deal.contact === 'object' && deal.contact) return deal.contact._id;
    return deal.contact as string;
  };

  const getContactName = (deal: Deal): string => {
    if (typeof deal.contact === 'object' && deal.contact) return deal.contact.name;
    return '';
  };

  const openCreateModal = useCallback(() => {
    setEditingDeal(null);
    reset({ title: '', value: '', stage: 'Qualification', contact: '', notes: '', expectedCloseDate: '' });
    setModalOpen(true);
  }, [reset]);

  const openEditModal = useCallback((deal: Deal) => {
    setEditingDeal(deal);
    reset({
      title: deal.title,
      value: String(deal.value),
      stage: deal.stage,
      contact: getContactId(deal),
      notes: deal.notes || '',
      expectedCloseDate: deal.expectedCloseDate ? format(new Date(deal.expectedCloseDate), 'yyyy-MM-dd') : '',
    });
    setModalOpen(true);
  }, [reset]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingDeal(null);
  }, []);

  const onSubmit = useCallback(async (formValues: DealFormValues) => {
    const values = { ...formValues, value: Number(formValues.value) };
    try {
      if (editingDeal) {
        await updateMutation.mutateAsync({ id: editingDeal._id, ...values });
        toast.success('Deal updated');
      } else {
        await createMutation.mutateAsync(values);
        toast.success('Deal created');
      }
      closeModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, [editingDeal, createMutation, updateMutation, closeModal]);

  const handleStageChange = useCallback(async (dealId: string, stage: DealStage) => {
    try {
      await updateStageMutation.mutateAsync({ id: dealId, stage });
      toast.success(`Moved to ${stage}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update stage');
    }
  }, [updateStageMutation]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingDeal) return;
    try {
      await deleteMutation.mutateAsync(deletingDeal._id);
      toast.success('Deal deleted');
      setDeletingDeal(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, [deletingDeal, deleteMutation]);

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;
  const getDealStage = (stage: string) => stage as DealStage;

  const dealsByStage = DEAL_STAGES.reduce((acc, stage) => {
    acc[stage] = deals.filter((d) => d.stage === stage);
    return acc;
  }, {} as Record<DealStage, Deal[]>);

  return (
    <div className="space-y-8">
      <section className="flex items-start justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Deals Pipeline</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Track deals through your sales pipeline.</p>
        </div>
        <Button onClick={openCreateModal}>
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Deal
        </Button>
      </section>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card><CardContent>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Total Deals</p>
            <p className="font-headline-lg text-headline-lg text-primary mt-1">{stats.total}</p>
          </CardContent></Card>
          <Card><CardContent>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Total Pipeline Value</p>
            <p className="font-headline-lg text-headline-lg text-primary mt-1">${stats.totalValue.toLocaleString()}</p>
          </CardContent></Card>
          <Card><CardContent>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Won Deals</p>
            <p className="font-headline-lg text-headline-lg text-primary mt-1">{stats.byStage['Closed Won'] || 0}</p>
          </CardContent></Card>
        </div>
      )}

      {isLoading ? (
        <div className="flex gap-6 overflow-x-auto pb-4">
          {DEAL_STAGES.map((stage) => (
            <div key={stage} className="min-w-[280px] flex-shrink-0">
              <div className="h-12 w-full bg-surface-container-low rounded-xl animate-pulse mb-4" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-surface-container-low rounded-xl animate-pulse mb-3" />
              ))}
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-6xl text-error mb-4">cloud_off</span>
          <p className="font-headline-sm text-headline-sm text-on-surface mb-1">Failed to load deals</p>
          <p className="text-body-md text-on-surface-variant">The server may be offline.</p>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4 min-h-[60vh]">
          {DEAL_STAGES.map((stage) => {
            const stageDeals = dealsByStage[stage];
            return (
              <div key={stage} className="min-w-[280px] max-w-[280px] flex-shrink-0">
                <div className={`px-4 py-3 rounded-xl mb-4 font-label-md text-label-md font-bold ${STAGE_COLORS[stage]}`}>
                  {stage}
                  <span className="ml-2 opacity-60">{stageDeals.length}</span>
                </div>
                <div className="space-y-3">
                  {stageDeals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-surface-container-low rounded-xl border border-dashed border-outline-variant/30">
                      <span className="material-symbols-outlined text-3xl text-outline-variant mb-2">move_item</span>
                      <p className="text-body-sm text-on-surface-variant">No deals</p>
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <Card key={deal._id} hoverable>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <p className="font-label-md text-label-md text-primary font-semibold">{deal.title}</p>
                            <div className="flex gap-1">
                              <button onClick={() => openEditModal(deal)} className="p-1 text-on-surface-variant hover:text-primary rounded transition-colors" title="Edit">
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                              <button onClick={() => setDeletingDeal(deal)} className="p-1 text-on-surface-variant hover:text-error rounded transition-colors" title="Delete">
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          </div>
                          <p className="font-headline-sm text-headline-sm text-primary font-bold">${deal.value.toLocaleString()}</p>
                          <div className="flex items-center gap-1 text-body-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-[14px]">person</span>
                            {getContactName(deal)}
                          </div>
                          {deal.expectedCloseDate && (
                            <div className="flex items-center gap-1 text-body-sm text-on-surface-variant">
                              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                              {format(new Date(deal.expectedCloseDate), 'MMM d, yyyy')}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {DEAL_STAGES.filter((s) => s !== deal.stage).map((s) => (
                              <button
                                key={s}
                                onClick={() => handleStageChange(deal._id, s)}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={modalOpen} onClose={closeModal} title={editingDeal ? 'Edit Deal' : 'New Deal'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input label="Deal Title" placeholder="Enterprise SaaS Deal" error={errors.title?.message} {...register('title')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Value ($)" type="text" placeholder="10000" error={errors.value?.message} {...register('value')} />
            <Select label="Stage" options={DEAL_STAGES.map((s) => ({ value: s, label: s }))} error={errors.stage?.message} {...register('stage')} />
          </div>
          <Select
            label="Contact"
            options={[{ value: '', label: 'Select a contact...' }, ...contacts.map((c) => ({ value: c._id, label: c.name }))]}
            error={errors.contact?.message}
            {...register('contact')}
          />
          <Input label="Expected Close Date" type="date" error={errors.expectedCloseDate?.message} {...register('expectedCloseDate')} />
          <Textarea label="Notes" placeholder="Deal notes..." rows={3} error={errors.notes?.message} {...register('notes')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={isFormSubmitting}>
              {isFormSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {editingDeal ? 'Updating...' : 'Creating...'}
                </span>
              ) : editingDeal ? 'Update Deal' : 'Create Deal'}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deletingDeal}
        onClose={() => setDeletingDeal(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Deal"
        message={`Are you sure you want to delete ${deletingDeal?.title ?? 'this deal'}?`}
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
