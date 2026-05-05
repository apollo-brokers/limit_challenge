'use client';

import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { Broker, PaginatedResponse } from '@/lib/types';

async function fetchBrokers() {
  const response = await apiClient.get<Broker[] | PaginatedResponse<Broker>>('/brokers/');
  const data = response.data;
  return Array.isArray(data) ? data : data.results ?? [];
}

export function useBrokerOptions() {
  return useQuery({
    queryKey: ['brokers'],
    queryFn: fetchBrokers,
    enabled: true,
  });
}
