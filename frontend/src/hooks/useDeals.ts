'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Deal, DealFormData, DealsApiResponse, DealStatsApiResponse, DealStage } from '@/constants/leadStatus';

export interface DealQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  stage?: string;
  sort?: string;
}

export function useGetDeals(params: DealQueryParams = {}) {
  return useQuery<DealsApiResponse>({
    queryKey: ['deals', params],
    queryFn: async () => {
      const { data } = await api.get('/deals', { params });
      return data;
    },
  });
}

export function useGetDeal(id: string) {
  return useQuery<Deal>({
    queryKey: ['deals', id],
    queryFn: async () => {
      const { data } = await api.get(`/deals/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useGetDealStats() {
  return useQuery<DealStatsApiResponse>({
    queryKey: ['deals', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/deals/stats');
      return data;
    },
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: DealFormData) => {
      const { data } = await api.post('/deals', formData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals', 'stats'] });
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...formData }: DealFormData & { id: string }) => {
      const { data } = await api.put(`/deals/${id}`, formData);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['deals', 'stats'] });
    },
  });
}

export function useUpdateDealStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: DealStage }) => {
      const { data } = await api.patch(`/deals/${id}/stage`, { stage });
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['deals', 'stats'] });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/deals/${id}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals', 'stats'] });
    },
  });
}
