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

describe('Beverage types (e2e)', () => {
  let app: INestApplication<App>;
  const createdTypeIds: string[] = [];

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
  });

  afterAll(async () => {
    await Promise.all(
      createdTypeIds.map((id) =>
        request(app.getHttpServer()).delete(`/api/v1/admin/beverage-types/${id}`),
      ),
    );
    await app.close();
  });

  describe('POST /admin/beverage-types', () => {
    it('creates a beverage type', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/beverage-types')
        .send({
          name: `E2E Lemonade ${Date.now()}`,
          description: 'Fresh-squeezed lemons, cane sugar, ice-cold.',
        })
        .expect(HttpStatus.CREATED);

      const body = response.body as { id: string; name: string };
      expect(body.id).toMatch(/^[0-9a-f-]{36}$/);
      createdTypeIds.push(body.id);
    });

    it('rejects a payload missing the required name field', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/beverage-types')
        .send({ description: 'Missing a name' })
        .expect(HttpStatus.BAD_REQUEST);

      const body = response.body as { message: string[] };
      expect(body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('name')]),
      );
    });

    it('rejects an unrecognized field due to forbidNonWhitelisted', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/beverage-types')
        .send({ name: `E2E Lemonade ${Date.now()}`, notARealField: true })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('rejects a duplicate name', async () => {
      const name = `E2E Duplicate ${Date.now()}`;
      const first = await request(app.getHttpServer())
        .post('/api/v1/admin/beverage-types')
        .send({ name })
        .expect(HttpStatus.CREATED);
      createdTypeIds.push((first.body as { id: string }).id);

      await request(app.getHttpServer())
        .post('/api/v1/admin/beverage-types')
        .send({ name })
        .expect(HttpStatus.CONFLICT);
    });
  });

  describe('GET /admin/beverage-types', () => {
    it('lists beverage types including one with no sizes yet', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/admin/beverage-types')
        .send({ name: `E2E List ${Date.now()}` })
        .expect(HttpStatus.CREATED);
      const id = (created.body as { id: string }).id;
      createdTypeIds.push(id);

      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/beverage-types')
        .expect(HttpStatus.OK);

      const body = response.body as { id: string; sizes: unknown[] }[];
      expect(body.some((type) => type.id === id)).toBe(true);
    });
  });

  describe('GET /admin/beverage-types/:id', () => {
    it('returns a single beverage type', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/admin/beverage-types')
        .send({ name: `E2E Get ${Date.now()}` })
        .expect(HttpStatus.CREATED);
      const id = (created.body as { id: string }).id;
      createdTypeIds.push(id);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/admin/beverage-types/${id}`)
        .expect(HttpStatus.OK);

      expect((response.body as { id: string }).id).toBe(id);
    });

    it('returns 404 for a beverage type that does not exist', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/beverage-types/00000000-0000-4000-8000-000000000000')
        .expect(HttpStatus.NOT_FOUND);
    });

    it('rejects an invalid uuid', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/beverage-types/not-a-uuid')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('PATCH /admin/beverage-types/:id', () => {
    it('updates a beverage type', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/admin/beverage-types')
        .send({ name: `E2E Patch ${Date.now()}` })
        .expect(HttpStatus.CREATED);
      const id = (created.body as { id: string }).id;
      createdTypeIds.push(id);

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/admin/beverage-types/${id}`)
        .send({ description: 'Now with a description' })
        .expect(HttpStatus.OK);

      expect((response.body as { description: string }).description).toBe(
        'Now with a description',
      );
    });

    it('returns 404 when updating a beverage type that does not exist', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/admin/beverage-types/00000000-0000-4000-8000-000000000000')
        .send({ description: 'No such type' })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /admin/beverage-types/:id', () => {
    it('deletes a beverage type', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/admin/beverage-types')
        .send({ name: `E2E Delete ${Date.now()}` })
        .expect(HttpStatus.CREATED);
      const id = (created.body as { id: string }).id;

      await request(app.getHttpServer())
        .delete(`/api/v1/admin/beverage-types/${id}`)
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .get(`/api/v1/admin/beverage-types/${id}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('returns 404 when deleting a beverage type that does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/admin/beverage-types/00000000-0000-4000-8000-000000000000')
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('GET /customer/beverage-types', () => {
    it('excludes beverage types with no sizes', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/admin/beverage-types')
        .send({ name: `E2E No Sizes ${Date.now()}` })
        .expect(HttpStatus.CREATED);
      const id = (created.body as { id: string }).id;
      createdTypeIds.push(id);

      const response = await request(app.getHttpServer())
        .get('/api/v1/customer/beverage-types')
        .expect(HttpStatus.OK);

      const body = response.body as { id: string }[];
      expect(body.some((type) => type.id === id)).toBe(false);
    });

    it('includes a beverage type once it has a size', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/admin/beverage-types')
        .send({ name: `E2E With Size ${Date.now()}` })
        .expect(HttpStatus.CREATED);
      const id = (created.body as { id: string }).id;
      createdTypeIds.push(id);

      await request(app.getHttpServer())
        .post('/api/v1/admin/beverage-sizes')
        .send({ label: 'Small', price: 2, beverageTypeId: id })
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .get('/api/v1/customer/beverage-types')
        .expect(HttpStatus.OK);

      const body = response.body as { id: string }[];
      expect(body.some((type) => type.id === id)).toBe(true);
    });
  });
});
