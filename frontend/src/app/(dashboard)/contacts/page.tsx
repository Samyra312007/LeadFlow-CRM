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
import { Pagination } from '@/components/leads/pagination';
import { useGetContacts, useCreateContact, useUpdateContact, useDeleteContact } from '@/hooks/useContacts';
import { CONTACT_SOURCES } from '@/constants/leadStatus';
import type { Contact, ContactFormData, ContactSource } from '@/constants/leadStatus';

const contactFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().trim().min(7, 'Phone too short'),
  company: z.string().trim().max(150, 'Company too long'),
  position: z.string().trim().max(100, 'Position too long'),
  source: z.enum(['Referral', 'Website', 'LinkedIn', 'Cold Call', 'Email', 'Event', 'Other'] as const),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [localSearch, setLocalSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  const { data, isLoading, isError } = useGetContacts({ page, limit: 10, search });
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();
  const deleteMutation = useDeleteContact();

  const contacts = data?.data;
  const pagination = data?.pagination;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
  });

  const openCreateModal = useCallback(() => {
    setEditingContact(null);
    reset({ name: '', email: '', phone: '', company: '', position: '', source: 'Referral', notes: '' });
    setModalOpen(true);
  }, [reset]);

  const openEditModal = useCallback((contact: Contact) => {
    setEditingContact(contact);
    reset({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      position: contact.position,
      source: contact.source,
      notes: contact.notes || '',
    });
    setModalOpen(true);
  }, [reset]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingContact(null);
  }, []);

  const onSubmit = useCallback(async (values: ContactFormValues) => {
    try {
      if (editingContact) {
        await updateMutation.mutateAsync({ id: editingContact._id, ...values });
        toast.success('Contact updated');
      } else {
        await createMutation.mutateAsync(values);
        toast.success('Contact created');
      }
      closeModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, [editingContact, createMutation, updateMutation, closeModal]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingContact) return;
    try {
      await deleteMutation.mutateAsync(deletingContact._id);
      toast.success('Contact deleted');
      setDeletingContact(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, [deletingContact, deleteMutation]);

  const handleSearchChange = useCallback((val: string) => {
    setLocalSearch(val);
    const timer = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-8">
      <section className="flex items-start justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Contacts</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage your contacts.</p>
        </div>
        <Button onClick={openCreateModal}>
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Contact
        </Button>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-primary">All Contacts</h3>
            <span className="text-body-sm text-on-surface-variant">{pagination?.total ?? 0} total</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant">search</span>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary-container focus:border-secondary transition-all"
            />
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-surface-container-low rounded-xl animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-6xl text-error mb-4">cloud_off</span>
              <p className="font-headline-sm text-headline-sm text-on-surface mb-1">Failed to load contacts</p>
              <p className="text-body-md text-on-surface-variant">The server may be offline.</p>
            </div>
          ) : !contacts || contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">contact_page</span>
              <p className="font-headline-sm text-headline-sm text-on-surface mb-1">No contacts yet</p>
              <p className="text-body-md text-on-surface-variant">Create your first contact to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container-low">
                    {['Name', 'Email', 'Phone', 'Company', 'Position', 'Source', 'Created'].map((h) => (
                      <th key={h} className="px-4 py-3.5 text-left text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">{h}</th>
                    ))}
                    <th className="px-4 py-3.5 text-right text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact._id} className="border-t border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3.5"><p className="font-body-md text-body-md text-primary font-medium">{contact.name}</p></td>
                      <td className="px-4 py-3.5"><p className="font-body-sm text-body-sm text-on-surface-variant">{contact.email}</p></td>
                      <td className="px-4 py-3.5"><p className="font-body-sm text-body-sm text-on-surface-variant">{contact.phone}</p></td>
                      <td className="px-4 py-3.5"><p className="font-body-sm text-body-sm text-on-surface">{contact.company}</p></td>
                      <td className="px-4 py-3.5"><p className="font-body-sm text-body-sm text-on-surface-variant">{contact.position}</p></td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-container-highest text-on-surface-variant">
                          {contact.source}
                        </span>
                      </td>
                      <td className="px-4 py-3.5"><p className="font-body-sm text-body-sm text-on-surface-variant">{format(new Date(contact.createdAt), 'MMM d, yyyy')}</p></td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEditModal(contact)} className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors" title="Edit">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button onClick={() => setDeletingContact(contact)} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors" title="Delete">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination pagination={pagination} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onClose={closeModal} title={editingContact ? 'Edit Contact' : 'New Contact'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" placeholder="John Doe" error={errors.name?.message} {...register('name')} />
            <Input label="Email" type="email" placeholder="john@company.com" error={errors.email?.message} {...register('email')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Phone" placeholder="+1 (555) 123-4567" error={errors.phone?.message} {...register('phone')} />
            <Input label="Company" placeholder="Acme Corp" error={errors.company?.message} {...register('company')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Position" placeholder="CEO" error={errors.position?.message} {...register('position')} />
            <Select label="Source" options={CONTACT_SOURCES.map((s) => ({ value: s, label: s }))} error={errors.source?.message} {...register('source')} />
          </div>
          <Textarea label="Notes" placeholder="Any additional notes..." rows={3} error={errors.notes?.message} {...register('notes')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={isFormSubmitting}>
              {isFormSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {editingContact ? 'Updating...' : 'Creating...'}
                </span>
              ) : editingContact ? 'Update Contact' : 'Create Contact'}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deletingContact}
        onClose={() => setDeletingContact(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Contact"
        message={`Are you sure you want to delete ${deletingContact?.name ?? 'this contact'}?`}
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
