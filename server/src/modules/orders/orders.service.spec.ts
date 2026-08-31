import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BeverageSizesService } from '../beverages/sizes/beverage-sizes.service';
import { ContactMethod } from './entities/order.entity';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

type MockRepository = Partial<Record<keyof Repository<Order>, jest.Mock>>;

const createMockRepository = (): MockRepository => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
});

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: MockRepository;
  let beverageSizesService: { findByIds: jest.Mock };

  const smallSize = {
    id: 'size-small',
    label: 'Small',
    price: '2.00',
    beverageTypeId: 'type-1',
    beverageType: { id: 'type-1', name: 'Classic Lemonade' },
  };

  beforeEach(async () => {
    beverageSizesService = { findByIds: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: createMockRepository(),
        },
        { provide: BeverageSizesService, useValue: beverageSizesService },
      ],
    }).compile();

    service = module.get(OrdersService);
    repository = module.get(getRepositoryToken(Order));
  });

  describe('create', () => {
    it('computes the total price from the ordered items and generates a confirmation number', async () => {
      beverageSizesService.findByIds.mockResolvedValue([smallSize]);
      repository.findOne!.mockResolvedValue(null); // confirmation number is unused so far
      repository.create!.mockImplementation((value: Partial<Order>) => value);
      repository.save!.mockImplementation((value: Partial<Order>) =>
        Promise.resolve({ id: 'order-1', ...value }),
      );

      const result = await service.create({
        customerName: 'Jane Doe',
        contactMethod: ContactMethod.EMAIL,
        customerContact: 'jane@example.com',
        items: [
          { beverageTypeId: 'type-1', sizeId: 'size-small', quantity: 3 },
        ],
      });

      expect(result.totalPrice).toBe('6.00');
      expect(result.confirmationNumber).toMatch(/^LM-\d{6}$/);
      expect(result.orderDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result.items[0]).toMatchObject({
        beverageName: 'Classic Lemonade',
        sizeLabel: 'Small',
        unitPrice: '2.00',
        quantity: 3,
      });
    });

    it('scopes the confirmation number collision check to the order date, so numbers can repeat on other days', async () => {
      beverageSizesService.findByIds.mockResolvedValue([smallSize]);
      repository.findOne!.mockResolvedValue(null);
      repository.create!.mockImplementation((value: Partial<Order>) => value);
      repository.save!.mockImplementation((value: Partial<Order>) =>
        Promise.resolve(value),
      );

      const result = await service.create({
        customerName: 'Jane Doe',
        contactMethod: ContactMethod.EMAIL,
        customerContact: 'jane@example.com',
        items: [
          { beverageTypeId: 'type-1', sizeId: 'size-small', quantity: 1 },
        ],
      });

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          confirmationNumber: expect.stringMatching(/^LM-\d{6}$/) as string,
          orderDate: result.orderDate,
        },
      });
    });

    it('sums multiple line items correctly', async () => {
      const largeSize = {
        ...smallSize,
        id: 'size-large',
        label: 'Large',
        price: '4.00',
      };
      beverageSizesService.findByIds.mockResolvedValue([smallSize, largeSize]);
      repository.findOne!.mockResolvedValue(null);
      repository.create!.mockImplementation((value: Partial<Order>) => value);
      repository.save!.mockImplementation((value: Partial<Order>) =>
        Promise.resolve(value),
      );

      const result = await service.create({
        customerName: 'Jane Doe',
        contactMethod: ContactMethod.PHONE,
        customerContact: '555-1234',
        items: [
          { beverageTypeId: 'type-1', sizeId: 'size-small', quantity: 2 }, // 4.00
          { beverageTypeId: 'type-1', sizeId: 'size-large', quantity: 1 }, // 4.00
        ],
      });

      expect(result.totalPrice).toBe('8.00');
    });

    it('looks up every line item in a single batched query, regardless of item count', async () => {
      const largeSize = {
        ...smallSize,
        id: 'size-large',
        label: 'Large',
        price: '4.00',
      };
      beverageSizesService.findByIds.mockResolvedValue([smallSize, largeSize]);
      repository.findOne!.mockResolvedValue(null);
      repository.create!.mockImplementation((value: Partial<Order>) => value);
      repository.save!.mockImplementation((value: Partial<Order>) =>
        Promise.resolve(value),
      );

      await service.create({
        customerName: 'Jane Doe',
        contactMethod: ContactMethod.EMAIL,
        customerContact: 'jane@example.com',
        items: [
          { beverageTypeId: 'type-1', sizeId: 'size-small', quantity: 2 },
          { beverageTypeId: 'type-1', sizeId: 'size-large', quantity: 1 },
          { beverageTypeId: 'type-1', sizeId: 'size-small', quantity: 1 },
        ],
      });

      expect(beverageSizesService.findByIds).toHaveBeenCalledTimes(1);
      expect(beverageSizesService.findByIds).toHaveBeenCalledWith([
        'size-small',
        'size-large',
      ]);
    });

    it('rejects a size that does not belong to the requested beverage type', async () => {
      beverageSizesService.findByIds.mockResolvedValue([smallSize]);

      await expect(
        service.create({
          customerName: 'Jane Doe',
          contactMethod: ContactMethod.EMAIL,
          customerContact: 'jane@example.com',
          items: [
            { beverageTypeId: 'wrong-type', sizeId: 'size-small', quantity: 1 },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when a requested size does not exist', async () => {
      beverageSizesService.findByIds.mockResolvedValue([]); // no sizes matched

      await expect(
        service.create({
          customerName: 'Jane Doe',
          contactMethod: ContactMethod.EMAIL,
          customerContact: 'jane@example.com',
          items: [{ beverageTypeId: 'type-1', sizeId: 'missing', quantity: 1 }],
        }),
      ).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('retries confirmation number generation on collision', async () => {
      beverageSizesService.findByIds.mockResolvedValue([smallSize]);
      repository
        .findOne!.mockResolvedValueOnce({ id: 'existing-order' }) // first candidate collides
        .mockResolvedValueOnce(null); // second candidate is free
      repository.create!.mockImplementation((value: Partial<Order>) => value);
      repository.save!.mockImplementation((value: Partial<Order>) =>
        Promise.resolve(value),
      );

      const result = await service.create({
        customerName: 'Jane Doe',
        contactMethod: ContactMethod.EMAIL,
        customerContact: 'jane@example.com',
        items: [
          { beverageTypeId: 'type-1', sizeId: 'size-small', quantity: 1 },
        ],
      });

      expect(repository.findOne).toHaveBeenCalledTimes(2);
      expect(result.confirmationNumber).toMatch(/^LM-\d{6}$/);
    });

    it('throws when every confirmation number candidate collides', async () => {
      beverageSizesService.findByIds.mockResolvedValue([smallSize]);
      repository.findOne!.mockResolvedValue({ id: 'existing-order' }); // every candidate collides
      repository.create!.mockImplementation((value: Partial<Order>) => value);

      await expect(
        service.create({
          customerName: 'Jane Doe',
          contactMethod: ContactMethod.EMAIL,
          customerContact: 'jane@example.com',
          items: [
            { beverageTypeId: 'type-1', sizeId: 'size-small', quantity: 1 },
          ],
        }),
      ).rejects.toThrow('Failed to generate a unique confirmation number');
      expect(repository.findOne).toHaveBeenCalledTimes(5);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns orders sorted by newest first', async () => {
      const orders = [{ id: '1' }, { id: '2' }];
      repository.find!.mockResolvedValue(orders);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(orders);
    });
  });
});
