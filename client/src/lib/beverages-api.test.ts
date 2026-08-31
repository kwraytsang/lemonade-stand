import { fetchBeverageTypes } from './beverages-api';
import { apiClient } from './api-client';

jest.mock('./api-client', () => ({
  apiClient: { get: jest.fn() },
}));

const mockedGet = apiClient.get as jest.Mock;

describe('fetchBeverageTypes', () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it('requests the customer beverage-types endpoint', async () => {
    mockedGet.mockResolvedValue([]);

    await fetchBeverageTypes();

    expect(mockedGet).toHaveBeenCalledWith('/customer/beverage-types');
  });

  it('converts each size price from a decimal string to a number', async () => {
    mockedGet.mockResolvedValue([
      {
        id: '1',
        name: 'Classic Lemonade',
        description: 'Fresh-squeezed lemons.',
        sizes: [
          { id: 's1', label: 'Small', price: '2.50', beverageTypeId: '1' },
          { id: 's2', label: 'Large', price: '4.00', beverageTypeId: '1' },
        ],
      },
    ]);

    const [result] = await fetchBeverageTypes();

    expect(result.sizes).toEqual([
      { id: 's1', label: 'Small', price: 2.5 },
      { id: 's2', label: 'Large', price: 4 },
    ]);
  });

  it('maps a null description to undefined', async () => {
    mockedGet.mockResolvedValue([
      { id: '1', name: 'Seasonal Special', description: null, sizes: [] },
    ]);

    const [result] = await fetchBeverageTypes();

    expect(result.description).toBeUndefined();
  });

  it('preserves a beverage type with no sizes as an empty array', async () => {
    mockedGet.mockResolvedValue([
      { id: '1', name: 'Seasonal Special', description: null, sizes: [] },
    ]);

    const [result] = await fetchBeverageTypes();

    expect(result.sizes).toEqual([]);
  });
});
