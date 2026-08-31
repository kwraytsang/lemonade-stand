import { randomInt } from 'node:crypto';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BeverageSizesService } from '../beverages/sizes/beverage-sizes.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    private readonly beverageSizesService: BeverageSizesService,
  ) {}

  async create(dto: CreateOrderDto) {
    const sizeIds = [...new Set(dto.items.map((item) => item.sizeId))];
    const sizes = await this.beverageSizesService.findByIds(sizeIds);
    const sizeById = new Map(sizes.map((size) => [size.id, size]));

    const items: OrderItem[] = [];
    let totalPrice = 0;

    for (const requestedItem of dto.items) {
      const size = sizeById.get(requestedItem.sizeId);
      if (!size) {
        throw new NotFoundException(
          `Beverage size ${requestedItem.sizeId} not found`,
        );
      }
      if (size.beverageTypeId !== requestedItem.beverageTypeId) {
        throw new BadRequestException(
          `Size ${requestedItem.sizeId} does not belong to beverage type ${requestedItem.beverageTypeId}`,
        );
      }

      const unitPrice = Number(size.price);
      totalPrice += unitPrice * requestedItem.quantity;

      items.push(
        Object.assign(new OrderItem(), {
          beverageTypeId: size.beverageTypeId,
          beverageName: size.beverageType.name,
          sizeId: size.id,
          sizeLabel: size.label,
          unitPrice: unitPrice.toFixed(2),
          quantity: requestedItem.quantity,
        }),
      );
    }

    const orderDate = this.getTodayDateString();

    const order = this.orders.create({
      customerName: dto.customerName,
      contactMethod: dto.contactMethod,
      customerContact: dto.customerContact,
      totalPrice: totalPrice.toFixed(2),
      orderDate,
      confirmationNumber:
        await this.generateUniqueConfirmationNumber(orderDate),
      items,
    });

    return this.orders.save(order);
  }

  findAll() {
    return this.orders.find({ order: { createdAt: 'DESC' } });
  }

  /** Confirmation numbers only need to be unique within a single day, so the same number can be reused on a later date. */
  private async generateUniqueConfirmationNumber(
    orderDate: string,
  ): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = `LM-${randomInt(100000, 999999)}`;
      const existing = await this.orders.findOne({
        where: { confirmationNumber: candidate, orderDate },
      });
      if (!existing) {
        return candidate;
      }
    }
    throw new Error('Failed to generate a unique confirmation number');
  }

  private getTodayDateString(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
