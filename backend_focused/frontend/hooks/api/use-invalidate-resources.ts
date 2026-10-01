'use client';

import { useQueryClient } from '@tanstack/react-query';

type Resource = 'offices' | 'mechanics' | 'vehicles' | 'maintenance';

export function useInvalidateResources(resources: Resource[]) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(
      resources.map((resource) => queryClient.invalidateQueries({ queryKey: [resource] })),
    );
}
