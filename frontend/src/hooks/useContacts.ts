'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Contact, ContactFormData, ContactsApiResponse } from '@/constants/leadStatus';

export interface ContactQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

export function useGetContacts(params: ContactQueryParams = {}) {
  return useQuery<ContactsApiResponse>({
    queryKey: ['contacts', params],
    queryFn: async () => {
      const { data } = await api.get('/contacts', { params });
      return data;
    },
  });
}

export function useGetContact(id: string) {
  return useQuery<Contact>({
    queryKey: ['contacts', id],
    queryFn: async () => {
      const { data } = await api.get(`/contacts/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: ContactFormData) => {
      const { data } = await api.post('/contacts', formData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...formData }: ContactFormData & { id: string }) => {
      const { data } = await api.put(`/contacts/${id}`, formData);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contacts', variables.id] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/contacts/${id}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
