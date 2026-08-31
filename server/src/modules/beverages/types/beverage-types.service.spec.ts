import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BeverageTypesService } from './beverage-types.service';
import { BeverageType } from './entities/beverage-type.entity';

type MockRepository = Partial<
  Record<keyof Repository<BeverageType>, jest.Mock>
>;

const createMockRepository = (): MockRepository => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('BeverageTypesService', () => {
  let service: BeverageTypesService;
  let repository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BeverageTypesService,
        {
          provide: getRepositoryToken(BeverageType),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get(BeverageTypesService);
    repository = module.get(getRepositoryToken(BeverageType));
  });

  describe('create', () => {
    it('creates and saves a beverage type', async () => {
      const dto = { name: 'Classic Lemonade', description: 'Fresh-squeezed.' };
      const entity = { id: '1', sizes: [], ...dto };
      repository.create!.mockReturnValue(entity);
      repository.save!.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });
  });

  describe('findAll', () => {
    it('returns all beverage types with their sizes', async () => {
      const list = [{ id: '1', name: 'Iced Tea', sizes: [] }];
      repository.find!.mockResolvedValue(list);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        relations: { sizes: true },
      });
      expect(result).toEqual(list);
    });
  });

  describe('findAllOrderable', () => {
    it('returns beverage types that have at least one priced size', async () => {
      const list = [
        {
          id: '1',
          name: 'Iced Tea',
          sizes: [{ id: 's1', label: 'Small', price: '2.00' }],
        },
      ];
      repository.find!.mockResolvedValue(list);

      const result = await service.findAllOrderable();

      expect(result).toEqual(list);
    });

    it('excludes a beverage type that has no sizes (and therefore no price)', async () => {
      const list = [
        {
          id: '1',
          name: 'Iced Tea',
          sizes: [{ id: 's1', label: 'Small', price: '2.00' }],
        },
        { id: '2', name: 'Classic Lemonade', sizes: [] },
      ];
      repository.find!.mockResolvedValue(list);

      const result = await service.findAllOrderable();

      expect(result).toEqual([list[0]]);
    });
  });

  describe('findOne', () => {
    it('returns the beverage type when found', async () => {
      const entity = { id: '1', name: 'Iced Tea', sizes: [] };
      repository.findOne!.mockResolvedValue(entity);

      const result = await service.findOne('1');

      expect(result).toEqual(entity);
    });

    it('throws NotFoundException when the beverage type does not exist', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('merges the dto into the existing entity and saves it', async () => {
      const entity = {
        id: '1',
        name: 'Iced Tea',
        description: undefined,
        sizes: [],
      };
      repository.findOne!.mockResolvedValue(entity);
      repository.save!.mockImplementation((value) => Promise.resolve(value));

      const result = await service.update('1', {
        description: 'Now with lemon',
      });

      expect(result.description).toBe('Now with lemon');
      expect(repository.save).toHaveBeenCalled();
    });

    it('throws NotFoundException when updating a missing beverage type', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.update('missing', { name: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('removes the beverage type when found', async () => {
      const entity = { id: '1', name: 'Iced Tea', sizes: [] };
      repository.findOne!.mockResolvedValue(entity);

      await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(entity);
    });

    it('throws NotFoundException when removing a missing beverage type', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
