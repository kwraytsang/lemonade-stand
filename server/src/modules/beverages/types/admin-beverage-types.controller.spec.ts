import { Test, TestingModule } from '@nestjs/testing';

import { AdminBeverageTypesController } from './admin-beverage-types.controller';
import { BeverageTypesService } from './beverage-types.service';

describe('AdminBeverageTypesController', () => {
  let controller: AdminBeverageTypesController;
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
      controllers: [AdminBeverageTypesController],
      providers: [{ provide: BeverageTypesService, useValue: service }],
    }).compile();

    controller = module.get(AdminBeverageTypesController);
  });

  it('delegates findAll to the service', async () => {
    const list = [{ id: 'type-1', name: 'Classic Lemonade' }];
    service.findAll.mockResolvedValue(list);

    await expect(controller.findAll()).resolves.toEqual(list);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('delegates findOne to the service with the given id', async () => {
    const entity = { id: 'type-1', name: 'Classic Lemonade' };
    service.findOne.mockResolvedValue(entity);

    await expect(controller.findOne('type-1')).resolves.toEqual(entity);
    expect(service.findOne).toHaveBeenCalledWith('type-1');
  });

  it('delegates create to the service', async () => {
    const dto = { name: 'Classic Lemonade', description: 'Fresh.' };
    const created = { id: '1', ...dto };
    service.create.mockResolvedValue(created);

    await expect(controller.create(dto)).resolves.toEqual(created);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('delegates update to the service with the given id', async () => {
    const dto = { name: 'Updated name' };
    const updated = { id: '1', ...dto };
    service.update.mockResolvedValue(updated);

    await expect(controller.update('1', dto)).resolves.toEqual(updated);
    expect(service.update).toHaveBeenCalledWith('1', dto);
  });

  it('delegates remove to the service with the given id', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('1');

    expect(service.remove).toHaveBeenCalledWith('1');
  });
});
