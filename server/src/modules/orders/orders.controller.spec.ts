import { Test, TestingModule } from '@nestjs/testing';

import { ContactMethod } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: { create: jest.Mock };

  beforeEach(async () => {
    service = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: service }],
    }).compile();

    controller = module.get(OrdersController);
  });

  it('delegates order creation to the service', async () => {
    const dto = {
      customerName: 'Jane Doe',
      contactMethod: ContactMethod.EMAIL,
      customerContact: 'jane@example.com',
      items: [{ beverageTypeId: 'type-1', sizeId: 'size-1', quantity: 1 }],
    };
    const created = { id: 'order-1', confirmationNumber: 'LM-123456' };
    service.create.mockResolvedValue(created);

    await expect(controller.create(dto)).resolves.toEqual(created);
    expect(service.create).toHaveBeenCalledWith(dto);
  });
});
