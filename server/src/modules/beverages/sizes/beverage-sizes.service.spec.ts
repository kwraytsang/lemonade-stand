import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BeverageTypesService } from '../types/beverage-types.service';
import { BeverageSizesService } from './beverage-sizes.service';
import { BeverageSize } from './entities/beverage-size.entity';

type MockRepository = Partial<
  Record<keyof Repository<BeverageSize>, jest.Mock>
>;

const createMockRepository = (): MockRepository => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('BeverageSizesService', () => {
  let service: BeverageSizesService;
  let repository: MockRepository;
  let beverageTypesService: { findOne: jest.Mock };

  beforeEach(async () => {
    beverageTypesService = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BeverageSizesService,
        {
          provide: getRepositoryToken(BeverageSize),
          useValue: createMockRepository(),
        },
        { provide: BeverageTypesService, useValue: beverageTypesService },
      ],
    }).compile();

    service = module.get(BeverageSizesService);
    repository = module.get(getRepositoryToken(BeverageSize));
  });

  describe('create', () => {
    it('validates the parent beverage type exists, formats the price, and saves', async () => {
      beverageTypesService.findOne.mockResolvedValue({ id: 'type-1' });
      const dto = { label: 'Small', price: 2, beverageTypeId: 'type-1' };
      const entity = {
        id: 'size-1',
        label: 'Small',
        price: '2.00',
        beverageTypeId: 'type-1',
      };
      repository.create!.mockReturnValue(entity);
      repository.save!.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(beverageTypesService.findOne).toHaveBeenCalledWith('type-1');
      expect(repository.create).toHaveBeenCalledWith({ ...dto, price: '2.00' });
      expect(result).toEqual(entity);
    });

    it('propagates NotFoundException when the parent beverage type is missing', async () => {
      beverageTypesService.findOne.mockRejectedValue(new NotFoundException());

      await expect(
        service.create({ label: 'Small', price: 2, beverageTypeId: 'missing' }),
      ).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('returns the size when found', async () => {
      const entity = { id: 'size-1', label: 'Small', price: '2.00' };
      repository.findOne!.mockResolvedValue(entity);

      const result = await service.findOne('size-1');

      expect(result).toEqual(entity);
    });

    it('throws NotFoundException when the size does not exist', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByIds', () => {
    it('fetches all requested sizes with their beverage type in a single query', async () => {
      const sizes = [
        { id: 'size-1', label: 'Small', price: '2.00' },
        { id: 'size-2', label: 'Large', price: '4.00' },
      ];
      repository.find!.mockResolvedValue(sizes);

      const result = await service.findByIds(['size-1', 'size-2']);

      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({ relations: { beverageType: true } }),
      );
      expect(result).toEqual(sizes);
    });

    it('returns an empty array without querying when given no ids', async () => {
      const result = await service.findByIds([]);

      expect(result).toEqual([]);
      expect(repository.find).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('reformats the price when provided', async () => {
      const entity = {
        id: 'size-1',
        label: 'Small',
        price: '2.00',
        beverageTypeId: 'type-1',
      };
      repository.findOne!.mockResolvedValue(entity);
      repository.save!.mockImplementation((value) => Promise.resolve(value));

      const result = await service.update('size-1', { price: 3.5 });

      expect(result.price).toBe('3.50');
    });

    it('keeps the existing price when not provided in the dto', async () => {
      const entity = {
        id: 'size-1',
        label: 'Small',
        price: '2.00',
        beverageTypeId: 'type-1',
      };
      repository.findOne!.mockResolvedValue(entity);
      repository.save!.mockImplementation((value) => Promise.resolve(value));

      const result = await service.update('size-1', { label: 'Medium' });

      expect(result.price).toBe('2.00');
      expect(result.label).toBe('Medium');
    });
  });

  describe('remove', () => {
    it('removes the size when found', async () => {
      const entity = { id: 'size-1' };
      repository.findOne!.mockResolvedValue(entity);

      await service.remove('size-1');

      expect(repository.remove).toHaveBeenCalledWith(entity);
    });
  });
});
