import { Test, TestingModule } from '@nestjs/testing';

import { BeverageSizesController } from './beverage-sizes.controller';
import { BeverageSizesService } from './beverage-sizes.service';

describe('BeverageSizesController', () => {
  let controller: BeverageSizesController;
  let service: { findAll: jest.Mock; findOne: jest.Mock };

  beforeEach(async () => {
    service = { findAll: jest.fn(), findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeverageSizesController],
      providers: [{ provide: BeverageSizesService, useValue: service }],
    }).compile();

    controller = module.get(BeverageSizesController);
  });

  it('delegates findAll to the service', async () => {
    const list = [{ id: 'size-1', label: 'Small' }];
    service.findAll.mockResolvedValue(list);

    await expect(controller.findAll()).resolves.toEqual(list);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('delegates findOne to the service with the given id', async () => {
    const entity = { id: 'size-1', label: 'Small' };
    service.findOne.mockResolvedValue(entity);

    await expect(controller.findOne('size-1')).resolves.toEqual(entity);
    expect(service.findOne).toHaveBeenCalledWith('size-1');
  });
});
