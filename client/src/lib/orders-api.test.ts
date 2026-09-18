import { toCreateOrderDto } from './orders-api';

describe('toCreateOrderDto', () => {
  it('maps cart items to the beverageTypeId/sizeId/quantity shape the API expects', () => {
    const dto = toCreateOrderDto({
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

    expect(dto).toEqual({
      customerName: 'Jane Doe',
      contactMethod: 'email',
      customerContact: 'jane@example.com',
      items: [{ beverageTypeId: 'type-1', sizeId: 'size-1', quantity: 2 }],
    });
  });

  it('maps every line item when the order has more than one', () => {
    const dto = toCreateOrderDto({
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

    expect(dto.items).toEqual([
      { beverageTypeId: 'type-1', sizeId: 'size-1', quantity: 1 },
      { beverageTypeId: 'type-2', sizeId: 'size-2', quantity: 3 },
    ]);
  });
});
