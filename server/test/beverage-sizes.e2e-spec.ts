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

describe('Beverage sizes (e2e)', () => {
  let app: INestApplication<App>;
  let beverageTypeId: string;
  const createdSizeIds: string[] = [];

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
      .send({ name: `E2E Sizes Lemonade ${Date.now()}` })
      .expect(HttpStatus.CREATED);
    beverageTypeId = (typeResponse.body as { id: string }).id;
  });

  afterAll(async () => {
    await Promise.all(
      createdSizeIds.map((id) =>
        request(app.getHttpServer()).delete(`/api/v1/admin/beverage-sizes/${id}`),
      ),
    );
    await request(app.getHttpServer()).delete(
      `/api/v1/admin/beverage-types/${beverageTypeId}`,
    );
    await app.close();
  });

  describe('POST /admin/beverage-sizes', () => {
    it('creates a beverage size and formats the price to two decimals', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/beverage-sizes')
        .send({ label: 'Small', price: 2, beverageTypeId })
        .expect(HttpStatus.CREATED);

      const body = response.body as { id: string; price: string };
      expect(body.price).toBe('2.00');
      createdSizeIds.push(body.id);
    });

    it('rejects a non-positive price', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/beverage-sizes')
        .send({ label: 'Free', price: 0, beverageTypeId })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('rejects a payload missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/beverage-sizes')
        .send({ price: 2, beverageTypeId })
        .expect(HttpStatus.BAD_REQUEST);

      const body = response.body as { message: string[] };
      expect(body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('label')]),
      );
    });

    it('rejects a beverageTypeId that does not reference an existing beverage type', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/beverage-sizes')
        .send({
          label: 'Small',
          price: 2,
          beverageTypeId: '00000000-0000-4000-8000-000000000000',
        })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('GET /admin/beverage-sizes', () => {
    it('lists beverage sizes with their beverage type', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/admin/beverage-sizes')
        .send({ label: 'Medium', price: 3, beverageTypeId })
        .expect(HttpStatus.CREATED);
      const id = (created.body as { id: string }).id;
      createdSizeIds.push(id);

      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/beverage-sizes')
        .expect(HttpStatus.OK);

      const body = response.body as {
        id: string;
        beverageType: { id: string };
      }[];
      const match = body.find((size) => size.id === id);
      expect(match?.beverageType.id).toBe(beverageTypeId);
    });
  });

  describe('GET /admin/beverage-sizes/:id', () => {
    it('returns 404 for a beverage size that does not exist', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/beverage-sizes/00000000-0000-4000-8000-000000000000')
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /admin/beverage-sizes/:id', () => {
    it('updates and reformats the price', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/admin/beverage-sizes')
        .send({ label: 'Large', price: 4, beverageTypeId })
        .expect(HttpStatus.CREATED);
      const id = (created.body as { id: string }).id;
      createdSizeIds.push(id);

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/admin/beverage-sizes/${id}`)
        .send({ price: 4.5 })
        .expect(HttpStatus.OK);

      expect((response.body as { price: string }).price).toBe('4.50');
    });

    it('returns 404 when updating a beverage size that does not exist', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/admin/beverage-sizes/00000000-0000-4000-8000-000000000000')
        .send({ price: 3 })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /admin/beverage-sizes/:id', () => {
    it('deletes a beverage size', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/admin/beverage-sizes')
        .send({ label: 'X-Large', price: 5, beverageTypeId })
        .expect(HttpStatus.CREATED);
      const id = (created.body as { id: string }).id;

      await request(app.getHttpServer())
        .delete(`/api/v1/admin/beverage-sizes/${id}`)
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .get(`/api/v1/admin/beverage-sizes/${id}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('returns 404 when deleting a beverage size that does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/admin/beverage-sizes/00000000-0000-4000-8000-000000000000')
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('GET /customer/beverage-sizes', () => {
    it('lists beverage sizes for customers', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/admin/beverage-sizes')
        .send({ label: 'Customer Small', price: 2, beverageTypeId })
        .expect(HttpStatus.CREATED);
      const id = (created.body as { id: string }).id;
      createdSizeIds.push(id);

      const response = await request(app.getHttpServer())
        .get('/api/v1/customer/beverage-sizes')
        .expect(HttpStatus.OK);

      const body = response.body as { id: string }[];
      expect(body.some((size) => size.id === id)).toBe(true);
    });
  });
});
