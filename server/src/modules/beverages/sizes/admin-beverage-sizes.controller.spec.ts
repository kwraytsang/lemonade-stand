import { Test, TestingModule } from '@nestjs/testing';

import { AdminBeverageSizesController } from './admin-beverage-sizes.controller';
import { BeverageSizesService } from './beverage-sizes.service';

describe('AdminBeverageSizesController', () => {
  let controller: AdminBeverageSizesController;
  let service: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminBeverageSizesController],
      providers: [{ provide: BeverageSizesService, useValue: service }],
    }).compile();

    controller = module.get(AdminBeverageSizesController);
  });

  it('delegates findAll to the service', async () => {
    const list = [{ id: 'size-1', label: 'Small', price: '2.00' }];
    service.findAll.mockResolvedValue(list);

    await expect(controller.findAll()).resolves.toEqual(list);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('delegates findOne to the service with the given id', async () => {
    const entity = { id: 'size-1', label: 'Small', price: '2.00' };
    service.findOne.mockResolvedValue(entity);

    await expect(controller.findOne('size-1')).resolves.toEqual(entity);
    expect(service.findOne).toHaveBeenCalledWith('size-1');
  });

  it('delegates create to the service', async () => {
    const dto = { label: 'Small', price: 2.5, beverageTypeId: 'type-1' };
    const created = { id: 'size-1', ...dto };
    service.create.mockResolvedValue(created);

    await expect(controller.create(dto)).resolves.toEqual(created);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('delegates update to the service with the given id', async () => {
    const dto = { price: 3.5 };
    const updated = { id: 'size-1', price: '3.50' };
    service.update.mockResolvedValue(updated);

    await expect(controller.update('size-1', dto)).resolves.toEqual(updated);
    expect(service.update).toHaveBeenCalledWith('size-1', dto);
  });

  it('delegates remove to the service with the given id', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('size-1');

    expect(service.remove).toHaveBeenCalledWith('size-1');
  });
});
