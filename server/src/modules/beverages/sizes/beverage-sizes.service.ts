import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { BeverageTypesService } from '../types/beverage-types.service';
import { CreateBeverageSizeDto } from './dto/create-beverage-size.dto';
import { UpdateBeverageSizeDto } from './dto/update-beverage-size.dto';
import { BeverageSize } from './entities/beverage-size.entity';

@Injectable()
export class BeverageSizesService {
  constructor(
    @InjectRepository(BeverageSize)
    private readonly beverageSizes: Repository<BeverageSize>,
    private readonly beverageTypesService: BeverageTypesService,
  ) {}

  async create(dto: CreateBeverageSizeDto) {
    await this.beverageTypesService.findOne(dto.beverageTypeId);
    const size = this.beverageSizes.create({
      ...dto,
      price: dto.price.toFixed(2),
    });
    return this.beverageSizes.save(size);
  }

  findAll() {
    return this.beverageSizes.find({ relations: { beverageType: true } });
  }

  async findOne(id: string) {
    const size = await this.beverageSizes.findOne({
      where: { id },
      relations: { beverageType: true },
    });
    if (!size) {
      throw new NotFoundException(`Beverage size ${id} not found`);
    }
    return size;
  }

  /** Fetches multiple sizes (with their beverage type) in a single query, for batch lookups. */
  findByIds(ids: string[]) {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }
    return this.beverageSizes.find({
      where: { id: In(ids) },
      relations: { beverageType: true },
    });
  }

  async update(id: string, dto: UpdateBeverageSizeDto) {
    const size = await this.findOne(id);
    if (dto.beverageTypeId) {
      await this.beverageTypesService.findOne(dto.beverageTypeId);
    }
    Object.assign(size, {
      ...dto,
      price: dto.price !== undefined ? dto.price.toFixed(2) : size.price,
    });
    return this.beverageSizes.save(size);
  }

  async remove(id: string) {
    const size = await this.findOne(id);
    await this.beverageSizes.remove(size);
  }
}
