import { ApiError, toApiError } from './api-error';

function fakeResponse(
  status: number,
  jsonImpl: () => Promise<unknown>,
): Response {
  return { status, json: jsonImpl } as Response;
}

describe('ApiError', () => {
  it('carries the status code and message', () => {
    const error = new ApiError(404, 'Not found');

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Not found');
    expect(error.name).toBe('ApiError');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('toApiError', () => {
  it('uses a single string message from the response body', async () => {
    const error = await toApiError(
      fakeResponse(404, async () => ({ message: 'Beverage type not found' })),
    );

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Beverage type not found');
  });

  it('joins an array of validation messages with newlines', async () => {
    const error = await toApiError(
      fakeResponse(400, async () => ({
        message: [
          'customerName should not be empty',
          'contactMethod must be a valid enum value',
        ],
      })),
    );

    expect(error.message).toBe(
      'customerName should not be empty\ncontactMethod must be a valid enum value',
    );
  });

  it('falls back to a generic message when the body has no message field', async () => {
    const error = await toApiError(fakeResponse(500, async () => ({})));

    expect(error.message).toBe('Request failed with status 500');
  });

  it('falls back to a generic message when the body is not valid JSON', async () => {
    const error = await toApiError(
      fakeResponse(502, () => {
        throw new Error('Unexpected token < in JSON');
      }),
    );

    expect(error.message).toBe('Request failed with status 502');
  });
});
