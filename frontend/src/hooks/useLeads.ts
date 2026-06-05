'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  Lead, LeadFormData,
  LeadsApiResponse, StatsApiResponse,
} from '@/constants/leadStatus';

export interface LeadQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
}

export function useGetLeads(params: LeadQueryParams = {}) {
  return useQuery<LeadsApiResponse>({
    queryKey: ['leads', params],
    queryFn: async () => {
      const { data } = await api.get('/leads', { params });
      return data;
    },
  });
}

export function useGetLead(id: string) {
  return useQuery<Lead>({
    queryKey: ['leads', id],
    queryFn: async () => {
      const { data } = await api.get(`/leads/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useGetStats() {
  return useQuery<StatsApiResponse>({
    queryKey: ['leads', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/leads/stats');
      return data;
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: LeadFormData) => {
      const { data } = await api.post('/leads', formData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', 'stats'] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...formData }: LeadFormData & { id: string }) => {
      const { data } = await api.put(`/leads/${id}`, formData);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leads', 'stats'] });
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/leads/${id}/status`, { status });
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leads', 'stats'] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', 'stats'] });
    },
  });
}
