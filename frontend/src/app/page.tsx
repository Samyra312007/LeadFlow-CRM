'use client';

import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import AppShell from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/dialog';
import { StatsCards } from '@/components/leads/stats-cards';
import { StatusChart } from '@/components/leads/status-chart';
import { LeadsTable } from '@/components/leads/leads-table';
import { LeadsToolbar } from '@/components/leads/leads-toolbar';
import { Pagination } from '@/components/leads/pagination';
import { LeadModal } from '@/components/leads/lead-modal';
import { useGetLeads, useGetStats, useCreateLead, useUpdateLead, useDeleteLead, useUpdateLeadStatus } from '@/hooks/useLeads';
import type { Lead, LeadFormData, LeadStatus } from '@/constants/leadStatus';

export default function DashboardPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);

  const { data: leadsRes, isLoading: leadsLoading, isError: leadsError, error: leadsErr } = useGetLeads({ page, limit: 10, search, status, sort });
  const { data: statsRes, isLoading: statsLoading, isError: statsError } = useGetStats();

  useEffect(() => {
    if (window.location.search === '?new=true') {
      setEditingLead(null);
      setModalOpen(true);
      window.history.replaceState(null, '', '/');
    }
  }, []);

  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const deleteMutation = useDeleteLead();
  const updateStatusMutation = useUpdateLeadStatus();

  const handleStatusChange = useCallback(async (id: string, status: LeadStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      toast.success(`Status changed to ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  }, [updateStatusMutation]);

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleStatus = useCallback((val: string) => {
    setStatus(val);
    setPage(1);
  }, []);

  const handleSort = useCallback((field: string) => {
    setSort(field);
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingLead(null);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((lead: Lead) => {
    setEditingLead(lead);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingLead(null);
  }, []);

  const handleFormSubmit = useCallback(async (values: LeadFormData) => {
    try {
      if (editingLead) {
        await updateMutation.mutateAsync({ id: editingLead._id, ...values });
        toast.success('Lead updated successfully');
      } else {
        await createMutation.mutateAsync(values);
        toast.success('Lead created successfully');
      }
      closeModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, [editingLead, createMutation, updateMutation, closeModal]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingLead) return;
    try {
      await deleteMutation.mutateAsync(deletingLead._id);
      toast.success('Lead deleted successfully');
      setDeletingLead(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, [deletingLead, deleteMutation]);

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;

  const apiError = leadsError || statsError;

  return (
    <AppShell>
      <div className="space-y-8">
        {apiError && (
          <div className="flex items-center gap-3 px-4 py-3 bg-error-container text-on-error-container rounded-xl text-body-sm">
            <span className="material-symbols-outlined text-lg">error</span>
            <p>Failed to load data. Please check that the backend server is running.</p>
          </div>
        )}

        <section className="flex items-start justify-between">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary">Dashboard</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Track your sales pipeline and manage leads.
            </p>
          </div>
          <Button onClick={openCreateModal}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Lead
          </Button>
        </section>

        <StatsCards data={statsRes?.data} isLoading={statsLoading} />

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="font-headline-sm text-headline-sm text-primary">Leads</h3>
                  <span className="text-body-sm text-on-surface-variant">
                    {leadsRes?.pagination?.total ?? 0} total
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <LeadsToolbar
                  search={search}
                  status={status}
                  onSearchChange={handleSearch}
                  onStatusChange={handleStatus}
                />
                <LeadsTable
                  leads={leadsRes?.data}
                  isLoading={leadsLoading}
                  isError={leadsError}
                  sort={sort}
                  onSort={handleSort}
                  onEdit={openEditModal}
                  onDelete={setDeletingLead}
                  onStatusChange={handleStatusChange}
                />
                <Pagination
                  pagination={leadsRes?.pagination}
                  onPageChange={(p) => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <StatusChart data={statsRes?.data} isLoading={statsLoading} />
          </div>
        </section>
      </div>

      <LeadModal
        open={modalOpen}
        onClose={closeModal}
        lead={editingLead}
        onSubmit={handleFormSubmit}
        isSubmitting={isFormSubmitting}
      />

      <ConfirmDialog
        open={!!deletingLead}
        onClose={() => setDeletingLead(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Lead"
        message={`Are you sure you want to delete ${deletingLead?.name ?? 'this lead'}? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
      />
    </AppShell>
  );
}
