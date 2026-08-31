import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useBeverages } from './use-beverages';
import { fetchBeverageTypes } from '@/lib/beverages-api';
import { ApiError } from '@/lib/api-error';

jest.mock('@/lib/beverages-api', () => ({
  fetchBeverageTypes: jest.fn(),
}));

const mockedFetchBeverageTypes = fetchBeverageTypes as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe('useBeverages', () => {
  beforeEach(() => {
    mockedFetchBeverageTypes.mockReset();
  });

  it('starts in a loading state and resolves with beverages', async () => {
    const beverages = [{ id: '1', name: 'Iced Tea', sizes: [] }];
    mockedFetchBeverageTypes.mockResolvedValue(beverages);

    const { result } = await renderHook(() => useBeverages(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.beverages).toEqual(beverages);
    expect(result.current.error).toBeNull();
  });

  it('surfaces the ApiError message when the request fails', async () => {
    mockedFetchBeverageTypes.mockRejectedValue(new ApiError(500, 'Something went wrong.'));

    const { result } = await renderHook(() => useBeverages(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Something went wrong.');
    expect(result.current.beverages).toEqual([]);
  });

  it('falls back to a generic message for a non-ApiError failure', async () => {
    mockedFetchBeverageTypes.mockRejectedValue(new Error('boom'));

    const { result } = await renderHook(() => useBeverages(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Something went wrong loading the menu. Please try again.');
  });

  it('refetch re-runs the request and clears a previous error', async () => {
    mockedFetchBeverageTypes.mockRejectedValueOnce(new ApiError(500, 'boom'));
    const { result } = await renderHook(() => useBeverages(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('boom');

    const beverages = [{ id: '1', name: 'Iced Tea', sizes: [] }];
    mockedFetchBeverageTypes.mockResolvedValueOnce(beverages);
    await act(() => result.current.refetch());

    await waitFor(() => expect(result.current.beverages).toEqual(beverages));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('exposes refreshing (not loading) while a pull-to-refresh refetch is in flight', async () => {
    const beverages = [{ id: '1', name: 'Iced Tea', sizes: [] }];
    mockedFetchBeverageTypes.mockResolvedValue(beverages);
    const { result } = await renderHook(() => useBeverages(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.refreshing).toBe(false);

    let resolveRefetch: (value: typeof beverages) => void = () => {};
    mockedFetchBeverageTypes.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRefetch = resolve;
      }),
    );

    void result.current.refetch();

    await waitFor(() => expect(result.current.refreshing).toBe(true));
    expect(result.current.loading).toBe(false);

    resolveRefetch(beverages);

    await waitFor(() => expect(result.current.refreshing).toBe(false));
  });
});
