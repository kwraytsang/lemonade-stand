import { useQuery } from '@tanstack/react-query';

import { ApiError } from '@/lib/api-error';
import { fetchBeverageTypes } from '@/lib/beverages-api';

export function useBeverages() {
  const { data, isPending, isRefetching, error, refetch } = useQuery({
    queryKey: ['beverage-types'],
    queryFn: fetchBeverageTypes,
  });

  return {
    beverages: data ?? [],
    loading: isPending,
    refreshing: isRefetching,
    error: error
      ? error instanceof ApiError
        ? error.message
        : 'Something went wrong loading the menu. Please try again.'
      : null,
    refetch,
  };
}
