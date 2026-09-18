import { toBeverageType } from './beverages-api';
import type { BeverageType as ApiBeverageType } from './api/generated/lemonadeStandAPI.schemas';

describe('toBeverageType', () => {
  it('converts each size price from a decimal string to a number', () => {
    const result = toBeverageType({
      id: '1',
      name: 'Classic Lemonade',
      description: 'Fresh-squeezed lemons.',
      sizes: [
        {
          id: 's1',
          label: 'Small',
          price: '2.50',
          beverageTypeId: '1',
          beverageType: {} as ApiBeverageType,
        },
        {
          id: 's2',
          label: 'Large',
          price: '4.00',
          beverageTypeId: '1',
          beverageType: {} as ApiBeverageType,
        },
      ],
    });

    expect(result.sizes).toEqual([
      { id: 's1', label: 'Small', price: 2.5 },
      { id: 's2', label: 'Large', price: 4 },
    ]);
  });

  it('maps a missing description to undefined', () => {
    const result = toBeverageType({
      id: '1',
      name: 'Seasonal Special',
      sizes: [],
    });

    expect(result.description).toBeUndefined();
  });

  it('preserves a beverage type with no sizes as an empty array', () => {
    const result = toBeverageType({
      id: '1',
      name: 'Seasonal Special',
      sizes: [],
    });

    expect(result.sizes).toEqual([]);
  });
});
