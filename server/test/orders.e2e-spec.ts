import {
  HttpStatus,
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Orders (e2e)', () => {
  let app: INestApplication<App>;
  let beverageTypeId: string;
  let sizeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();

    const typeResponse = await request(app.getHttpServer())
      .post('/api/v1/admin/beverage-types')
      .send({ name: `E2E Test Lemonade ${Date.now()}` })
      .expect(HttpStatus.CREATED);
    beverageTypeId = (typeResponse.body as { id: string }).id;

    const sizeResponse = await request(app.getHttpServer())
      .post('/api/v1/admin/beverage-sizes')
      .send({ label: 'E2E Test Size', price: 2.5, beverageTypeId })
      .expect(HttpStatus.CREATED);
    sizeId = (sizeResponse.body as { id: string }).id;
  });

  afterAll(async () => {
    await request(app.getHttpServer()).delete(
      `/api/v1/admin/beverage-types/${beverageTypeId}`,
    );
    await app.close();
  });

  describe('POST /customer/orders', () => {
    it('creates an order and returns a confirmation number', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/customer/orders')
        .send({
          customerName: 'Jane Doe',
          contactMethod: 'email',
          customerContact: 'jane@example.com',
          items: [{ beverageTypeId, sizeId, quantity: 2 }],
        })
        .expect(HttpStatus.CREATED);

      const body = response.body as {
        confirmationNumber: string;
        totalPrice: string;
        items: { sizeLabel: string; quantity: number }[];
      };
      expect(body.confirmationNumber).toMatch(/^LM-\d{6}$/);
      expect(body.totalPrice).toBe('5.00');
      expect(body.items[0]).toMatchObject({
        sizeLabel: 'E2E Test Size',
        quantity: 2,
      });
    });

    it('rejects a payload missing required fields with 400 and a validation message', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/customer/orders')
        .send({ items: [{ beverageTypeId, sizeId, quantity: 1 }] })
        .expect(HttpStatus.BAD_REQUEST);

      const body = response.body as { message: string[] };
      expect(body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('customerName')]),
      );
    });

    it('rejects an unrecognized field due to forbidNonWhitelisted', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/customer/orders')
        .send({
          customerName: 'Jane Doe',
          contactMethod: 'email',
          customerContact: 'jane@example.com',
          items: [{ beverageTypeId, sizeId, quantity: 1 }],
          discountCode: 'NOT-A-REAL-FIELD',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('rejects an invalid uuid for sizeId', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/customer/orders')
        .send({
          customerName: 'Jane Doe',
          contactMethod: 'email',
          customerContact: 'jane@example.com',
          items: [{ beverageTypeId, sizeId: 'not-a-uuid', quantity: 1 }],
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('rejects an email-formatted contactMethod with an invalid email address', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/customer/orders')
        .send({
          customerName: 'Jane Doe',
          contactMethod: 'email',
          customerContact: 'jane@example', // has "@" but no TLD — not a real email
          items: [{ beverageTypeId, sizeId, quantity: 1 }],
        })
        .expect(HttpStatus.BAD_REQUEST);

      const body = response.body as { message: string[] };
      expect(body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('valid email')]),
      );
    });

    it('rejects a non-positive quantity', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/customer/orders')
        .send({
          customerName: 'Jane Doe',
          contactMethod: 'email',
          customerContact: 'jane@example.com',
          items: [{ beverageTypeId, sizeId, quantity: 0 }],
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('returns 404 when the referenced size does not exist', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/customer/orders')
        .send({
          customerName: 'Jane Doe',
          contactMethod: 'email',
          customerContact: 'jane@example.com',
          items: [
            {
              beverageTypeId,
              sizeId: '00000000-0000-4000-8000-000000000000',
              quantity: 1,
            },
          ],
        })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('GET /admin/orders', () => {
    it('lists orders without requiring authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/orders')
        .expect(HttpStatus.OK);
    });
  });
});
