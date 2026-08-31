import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

import { AllExceptionsFilter } from './all-exceptions.filter';

function createHost(request: { method: string; url: string }) {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => request,
    }),
  } as unknown as ArgumentsHost;

  return { host, response };
}

describe('AllExceptionsFilter', () => {
  const request = { method: 'GET', url: '/api/v1/customer/beverage-types' };
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    jest.spyOn(filter['logger'], 'error').mockImplementation(() => undefined);
  });

  it('formats an HttpException with a plain string response body', () => {
    const { host, response } = createHost(request);

    filter.catch(
      new HttpException('Simple message', HttpStatus.I_AM_A_TEAPOT),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.I_AM_A_TEAPOT);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.I_AM_A_TEAPOT,
        error: 'HttpException',
        message: 'Simple message',
        path: request.url,
      }),
    );
  });

  it('formats a built-in HttpException, reading error/message from its structured response body', () => {
    const { host, response } = createHost(request);

    filter.catch(new NotFoundException('Beverage type missing'), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: 'Beverage type missing',
        path: request.url,
      }),
    );
  });

  it('formats an HttpException with a structured (validation) response body', () => {
    const { host, response } = createHost(request);

    filter.catch(new BadRequestException(['name should not be empty']), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: ['name should not be empty'],
      }),
    );
  });

  it('maps a Postgres unique violation to a 409 Conflict', () => {
    const { host, response } = createHost(request);
    const error = Object.assign(
      new QueryFailedError('query', [], new Error('duplicate')),
      {
        code: '23505',
      },
    );

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        message: 'A record with the same unique value already exists.',
      }),
    );
  });

  it('maps a Postgres foreign key violation to a 400 Bad Request', () => {
    const { host, response } = createHost(request);
    const error = Object.assign(
      new QueryFailedError('query', [], new Error('fk violation')),
      {
        code: '23503',
      },
    );

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'This operation references a record that does not exist.',
      }),
    );
  });

  it('maps a Postgres not-null violation to a 400 Bad Request', () => {
    const { host, response } = createHost(request);
    const error = Object.assign(
      new QueryFailedError('query', [], new Error('not null')),
      {
        code: '23502',
      },
    );

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'A required field is missing.' }),
    );
  });

  it('maps an unrecognized Postgres error code to a generic 400 Bad Request', () => {
    const { host, response } = createHost(request);
    const error = Object.assign(
      new QueryFailedError('query', [], new Error('other')),
      {
        code: '99999',
      },
    );

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'The request could not be processed due to invalid data.',
      }),
    );
  });

  it('falls back to a generic 500 for an unrecognized error', () => {
    const { host, response } = createHost(request);

    filter.catch(new Error('boom'), host);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'Something went wrong. Please try again later.',
      }),
    );
  });

  it('logs unhandled errors that result in a 5xx response', () => {
    const { host } = createHost(request);
    const loggerSpy = jest.spyOn(filter['logger'], 'error');

    filter.catch(new Error('boom'), host);

    expect(loggerSpy).toHaveBeenCalled();
  });

  it('does not log expected client errors (4xx)', () => {
    const { host } = createHost(request);
    const loggerSpy = jest.spyOn(filter['logger'], 'error');

    filter.catch(new NotFoundException('missing'), host);

    expect(loggerSpy).not.toHaveBeenCalled();
  });
});
