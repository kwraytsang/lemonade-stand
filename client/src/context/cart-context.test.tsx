import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';

import { CartProvider, useCart } from './cart-context';
import { submitOrder } from '@/lib/orders-api';

jest.mock('@/lib/orders-api', () => ({
  submitOrder: jest.fn(),
}));

const mockedSubmitOrder = submitOrder as jest.Mock;

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>{children}</CartProvider>
  </QueryClientProvider>
);

const smallLemonade = {
  beverageId: 'lemonade',
  beverageName: 'Classic Lemonade',
  sizeId: 'small',
  sizeLabel: 'Small',
  unitPrice: 2,
};

describe('CartProvider / useCart', () => {
  beforeEach(() => {
    mockedSubmitOrder.mockReset();
  });

  it('adds a new item to the cart', async () => {
    const { result } = await renderHook(() => useCart(), { wrapper });

    await act(() => result.current.addItem(smallLemonade, 2));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({
      ...smallLemonade,
      quantity: 2,
    });
    expect(result.current.total).toBe(4);
  });

  it('merges quantity when the same beverage and size is added again', async () => {
    const { result } = await renderHook(() => useCart(), { wrapper });

    await act(() => result.current.addItem(smallLemonade, 1));
    await act(() => result.current.addItem(smallLemonade, 2));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
  });

  it('keeps different sizes of the same beverage as separate line items', async () => {
    const { result } = await renderHook(() => useCart(), { wrapper });

    await act(() => result.current.addItem(smallLemonade, 1));
    await act(() =>
      result.current.addItem(
        { ...smallLemonade, sizeId: 'large', unitPrice: 4 },
        1,
      ),
    );

    expect(result.current.items).toHaveLength(2);
    expect(result.current.total).toBe(6);
  });

  it('updates the quantity of an existing line item', async () => {
    const { result } = await renderHook(() => useCart(), { wrapper });

    await act(() => result.current.addItem(smallLemonade, 1));
    await act(() => result.current.updateQuantity('lemonade', 'small', 5));

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.total).toBe(10);
  });

  it('removes the line item when its quantity is updated to zero', async () => {
    const { result } = await renderHook(() => useCart(), { wrapper });

    await act(() => result.current.addItem(smallLemonade, 1));
    await act(() => result.current.updateQuantity('lemonade', 'small', 0));

    expect(result.current.items).toHaveLength(0);
  });

  it('removes a line item directly', async () => {
    const { result } = await renderHook(() => useCart(), { wrapper });

    await act(() => result.current.addItem(smallLemonade, 1));
    await act(() => result.current.removeItem('lemonade', 'small'));

    expect(result.current.items).toHaveLength(0);
  });

  it('places an order successfully, storing the confirmation number and clearing the cart', async () => {
    mockedSubmitOrder.mockResolvedValue({ confirmationNumber: 'LM-123456' });
    const { result } = await renderHook(() => useCart(), { wrapper });

    await act(() => result.current.addItem(smallLemonade, 1));
    await act(() =>
      result.current.setContactDetails({
        customerName: 'Jane Doe',
        contactMethod: 'email',
        customerContact: 'jane@example.com',
      }),
    );

    await act(() => result.current.placeOrder());

    expect(result.current.confirmationNumber).toBe('LM-123456');
    expect(result.current.items).toHaveLength(0);
    expect(result.current.submitError).toBeNull();
  });

  it('surfaces an error message when placing the order fails', async () => {
    mockedSubmitOrder.mockRejectedValue(new Error('Network request failed'));
    const { result } = await renderHook(() => useCart(), { wrapper });

    await act(() => result.current.addItem(smallLemonade, 1));
    await act(() => result.current.placeOrder());

    expect(result.current.confirmationNumber).toBeNull();
    expect(result.current.submitError).toBe(
      'Something went wrong placing your order. Please try again.',
    );
    // the cart is preserved so the user can retry
    expect(result.current.items).toHaveLength(1);
  });

  it('resets all state', async () => {
    const { result } = await renderHook(() => useCart(), { wrapper });

    await act(() => result.current.addItem(smallLemonade, 1));
    await act(() =>
      result.current.setContactDetails({
        customerName: 'Jane Doe',
        contactMethod: 'phone',
        customerContact: '555-1234',
      }),
    );
    await act(() => result.current.reset());

    expect(result.current.items).toHaveLength(0);
    expect(result.current.customerName).toBe('');
  });
});
