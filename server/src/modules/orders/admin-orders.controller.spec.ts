import { Test, TestingModule } from '@nestjs/testing';

import { AdminOrdersController } from './admin-orders.controller';
import { OrdersService } from './orders.service';

describe('AdminOrdersController', () => {
  let controller: AdminOrdersController;
  let service: { findAll: jest.Mock };

  beforeEach(async () => {
    service = { findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminOrdersController],
      providers: [{ provide: OrdersService, useValue: service }],
    }).compile();

    controller = module.get(AdminOrdersController);
  });

  it('delegates findAll to the service', async () => {
    const orders = [{ id: 'order-1', confirmationNumber: 'LM-123456' }];
    service.findAll.mockResolvedValue(orders);

    await expect(controller.findAll()).resolves.toEqual(orders);
    expect(service.findAll).toHaveBeenCalled();
  });
});
