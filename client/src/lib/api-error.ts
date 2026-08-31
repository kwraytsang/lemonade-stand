export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ErrorBody = {
  message?: string | string[];
};

export async function toApiError(response: Response): Promise<ApiError> {
  let message = `Request failed with status ${response.status}`;
  try {
    const body: ErrorBody = await response.json();
    if (Array.isArray(body.message)) {
      message = body.message.join('\n');
    } else if (body.message) {
      message = body.message;
    }
  } catch {
    // response body wasn't JSON — fall back to the generic message above
  }
  return new ApiError(response.status, message);
}
