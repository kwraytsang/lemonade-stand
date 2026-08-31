import { Test, TestingModule } from '@nestjs/testing';

import { BeverageTypesController } from './beverage-types.controller';
import { BeverageTypesService } from './beverage-types.service';

describe('BeverageTypesController', () => {
  let controller: BeverageTypesController;
  let service: { findAllOrderable: jest.Mock; findOne: jest.Mock };

  beforeEach(async () => {
    service = { findAllOrderable: jest.fn(), findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeverageTypesController],
      providers: [{ provide: BeverageTypesService, useValue: service }],
    }).compile();

    controller = module.get(BeverageTypesController);
  });

  it('delegates findAll to the service', async () => {
    const list = [{ id: '1', name: 'Iced Tea' }];
    service.findAllOrderable.mockResolvedValue(list);

    await expect(controller.findAll()).resolves.toEqual(list);
    expect(service.findAllOrderable).toHaveBeenCalled();
  });

  it('delegates findOne to the service with the given id', async () => {
    const entity = { id: '1', name: 'Iced Tea' };
    service.findOne.mockResolvedValue(entity);

    await expect(controller.findOne('1')).resolves.toEqual(entity);
    expect(service.findOne).toHaveBeenCalledWith('1');
  });
});
