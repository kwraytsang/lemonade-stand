import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useBeverages } from './use-beverages';
import { customFetch } from '@/lib/api/custom-fetch';
import { ApiError } from '@/lib/api-error';

jest.mock('@/lib/api/custom-fetch', () => ({
  customFetch: jest.fn(),
}));

const mockedCustomFetch = customFetch as jest.Mock;

function wrappedResponse<T>(data: T) {
  return { data, status: 200, headers: new Headers() };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return Wrapper;
}

describe('useBeverages', () => {
  beforeEach(() => {
    mockedCustomFetch.mockReset();
  });

  it('starts in a loading state and resolves with beverages', async () => {
    const beverages = [{ id: '1', name: 'Iced Tea', sizes: [] }];
    mockedCustomFetch.mockResolvedValue(wrappedResponse(beverages));

    const { result } = await renderHook(() => useBeverages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.beverages).toEqual(beverages);
    expect(result.current.error).toBeNull();
  });

  it('surfaces the ApiError message when the request fails', async () => {
    mockedCustomFetch.mockRejectedValue(
      new ApiError(500, 'Something went wrong.'),
    );

    const { result } = await renderHook(() => useBeverages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Something went wrong.');
    expect(result.current.beverages).toEqual([]);
  });

  it('falls back to a generic message for a non-ApiError failure', async () => {
    mockedCustomFetch.mockRejectedValue(new Error('boom'));

    const { result } = await renderHook(() => useBeverages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(
      'Something went wrong loading the menu. Please try again.',
    );
  });

  it('refetch re-runs the request and clears a previous error', async () => {
    mockedCustomFetch.mockRejectedValueOnce(new ApiError(500, 'boom'));
    const { result } = await renderHook(() => useBeverages(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('boom');

    const beverages = [{ id: '1', name: 'Iced Tea', sizes: [] }];
    mockedCustomFetch.mockResolvedValueOnce(wrappedResponse(beverages));
    await act(() => result.current.refetch());

    await waitFor(() => expect(result.current.beverages).toEqual(beverages));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('exposes refreshing (not loading) while a pull-to-refresh refetch is in flight', async () => {
    const beverages = [{ id: '1', name: 'Iced Tea', sizes: [] }];
    mockedCustomFetch.mockResolvedValue(wrappedResponse(beverages));
    const { result } = await renderHook(() => useBeverages(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.refreshing).toBe(false);

    let resolveRefetch: (
      value: ReturnType<typeof wrappedResponse>,
    ) => void = () => {};
    mockedCustomFetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRefetch = resolve;
      }),
    );

    void result.current.refetch();

    await waitFor(() => expect(result.current.refreshing).toBe(true));
    expect(result.current.loading).toBe(false);

    resolveRefetch(wrappedResponse(beverages));

    await waitFor(() => expect(result.current.refreshing).toBe(false));
  });
});
