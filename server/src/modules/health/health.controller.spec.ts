import { Test, TestingModule } from '@nestjs/testing';
import { TerminusModule } from '@nestjs/terminus';
import { getDataSourceToken } from '@nestjs/typeorm';

import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: [
        {
          provide: getDataSourceToken(),
          useValue: {
            options: { type: 'postgres' },
            query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
          },
        },
      ],
    }).compile();

    controller = module.get(HealthController);
  });

  it('reports an ok status when the database is reachable', async () => {
    await expect(controller.check()).resolves.toMatchObject({
      status: 'ok',
      info: { database: { status: 'up' } },
    });
  });
});
