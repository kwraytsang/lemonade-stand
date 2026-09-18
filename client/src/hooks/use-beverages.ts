import { useMemo } from 'react';

import { useBeverageTypesControllerFindAll } from '@/lib/api/generated/customer-beverage-types/customer-beverage-types';
import { ApiError } from '@/lib/api-error';
import { toBeverageType } from '@/lib/beverages-api';

export function useBeverages() {
  const { data, isPending, isRefetching, error, refetch } =
    useBeverageTypesControllerFindAll();

  const beverages = useMemo(() => data?.data.map(toBeverageType) ?? [], [data]);

  return {
    beverages,
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
