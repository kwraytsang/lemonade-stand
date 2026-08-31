import { apiClient } from './api-client';

function mockFetchResponse(init: { ok: boolean; status: number; json?: () => Promise<unknown> }): Response {
  return {
    ok: init.ok,
    status: init.status,
    json: init.json ?? (async () => ({})),
  } as Response;
}

describe('apiClient', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  describe('get', () => {
    it('sends a GET request with JSON headers and returns the parsed body', async () => {
      const body = [{ id: '1', name: 'Iced Tea' }];
      (globalThis.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({ ok: true, status: 200, json: async () => body }));

      const result = await apiClient.get('/customer/beverage-types');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/customer/beverage-types'),
        expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) }),
      );
      expect(result).toEqual(body);
    });

    it('returns undefined for a 204 No Content response without reading a body', async () => {
      const jsonSpy = jest.fn();
      (globalThis.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({ ok: true, status: 204, json: jsonSpy }));

      const result = await apiClient.get('/admin/orders/1');

      expect(result).toBeUndefined();
      expect(jsonSpy).not.toHaveBeenCalled();
    });

    it('throws an ApiError carrying the server message when the response is not ok', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({ ok: false, status: 404, json: async () => ({ message: 'Beverage type not found' }) }),
      );

      await expect(apiClient.get('/customer/beverage-types/missing')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Beverage type not found',
      });
    });
  });

  describe('post', () => {
    it('sends a POST request with a JSON-stringified body and returns the parsed response', async () => {
      const responseBody = { confirmationNumber: 'LM-123456' };
      (globalThis.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({ ok: true, status: 201, json: async () => responseBody }),
      );
      const payload = { customerName: 'Jane Doe' };

      const result = await apiClient.post('/customer/orders', payload);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/customer/orders'),
        expect.objectContaining({ method: 'POST', body: JSON.stringify(payload) }),
      );
      expect(result).toEqual(responseBody);
    });

    it('throws an ApiError when the request fails', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({ ok: false, status: 400, json: async () => ({ message: ['customerName should not be empty'] }) }),
      );

      await expect(apiClient.post('/customer/orders', {})).rejects.toMatchObject({
        statusCode: 400,
        message: 'customerName should not be empty',
      });
    });
  });
});
