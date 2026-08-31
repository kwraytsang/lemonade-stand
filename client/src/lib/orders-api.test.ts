import { submitOrder } from './orders-api';
import { apiClient } from './api-client';

jest.mock('./api-client', () => ({
  apiClient: { post: jest.fn() },
}));

const mockedPost = apiClient.post as jest.Mock;

describe('submitOrder', () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it('maps cart items to the beverageTypeId/sizeId/quantity shape the API expects', async () => {
    mockedPost.mockResolvedValue({ confirmationNumber: 'LM-123456' });

    const result = await submitOrder({
      customerName: 'Jane Doe',
      contactMethod: 'email',
      customerContact: 'jane@example.com',
      items: [
        {
          beverageId: 'type-1',
          beverageName: 'Classic Lemonade',
          sizeId: 'size-1',
          sizeLabel: 'Small',
          unitPrice: 2.5,
          quantity: 2,
        },
      ],
    });

    expect(mockedPost).toHaveBeenCalledWith('/customer/orders', {
      customerName: 'Jane Doe',
      contactMethod: 'email',
      customerContact: 'jane@example.com',
      items: [{ beverageTypeId: 'type-1', sizeId: 'size-1', quantity: 2 }],
    });
    expect(result.confirmationNumber).toBe('LM-123456');
  });

  it('maps every line item when the order has more than one', async () => {
    mockedPost.mockResolvedValue({ confirmationNumber: 'LM-654321' });

    await submitOrder({
      customerName: 'Jane Doe',
      contactMethod: 'phone',
      customerContact: '555-1234',
      items: [
        {
          beverageId: 'type-1',
          beverageName: 'Classic Lemonade',
          sizeId: 'size-1',
          sizeLabel: 'Small',
          unitPrice: 2.5,
          quantity: 1,
        },
        {
          beverageId: 'type-2',
          beverageName: 'Iced Tea',
          sizeId: 'size-2',
          sizeLabel: 'Large',
          unitPrice: 4,
          quantity: 3,
        },
      ],
    });

    const [, body] = mockedPost.mock.calls[0] as [string, { items: unknown[] }];
    expect(body.items).toEqual([
      { beverageTypeId: 'type-1', sizeId: 'size-1', quantity: 1 },
      { beverageTypeId: 'type-2', sizeId: 'size-2', quantity: 3 },
    ]);
  });
});
