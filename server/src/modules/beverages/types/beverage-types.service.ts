import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateBeverageTypeDto } from './dto/create-beverage-type.dto';
import { UpdateBeverageTypeDto } from './dto/update-beverage-type.dto';
import { BeverageType } from './entities/beverage-type.entity';

@Injectable()
export class BeverageTypesService {
  constructor(
    @InjectRepository(BeverageType)
    private readonly beverageTypes: Repository<BeverageType>,
  ) {}

  create(dto: CreateBeverageTypeDto) {
    const beverageType = this.beverageTypes.create(dto);
    return this.beverageTypes.save(beverageType);
  }

  findAll() {
    return this.beverageTypes.find({ relations: { sizes: true } });
  }

  /** Beverage types that have at least one size, and are therefore orderable by a customer. */
  async findAllOrderable() {
    const types = await this.findAll();
    return types.filter((type) => type.sizes.length > 0);
  }

  async findOne(id: string) {
    const beverageType = await this.beverageTypes.findOne({
      where: { id },
      relations: { sizes: true },
    });
    if (!beverageType) {
      throw new NotFoundException(`Beverage type ${id} not found`);
    }
    return beverageType;
  }

  async update(id: string, dto: UpdateBeverageTypeDto) {
    const beverageType = await this.findOne(id);
    Object.assign(beverageType, dto);
    return this.beverageTypes.save(beverageType);
  }

  async remove(id: string) {
    const beverageType = await this.findOne(id);
    await this.beverageTypes.remove(beverageType);
  }
}
