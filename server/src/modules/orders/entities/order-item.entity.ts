import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { Order } from './order.entity';

@Entity()
export class OrderItem {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: () => Order })
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ApiProperty()
  @Column()
  orderId: string;

  @ApiProperty()
  @Column()
  beverageTypeId: string;

  @ApiProperty()
  @Column()
  beverageName: string;

  @ApiProperty()
  @Column()
  sizeId: string;

  @ApiProperty()
  @Column()
  sizeLabel: string;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: string;

  @ApiProperty()
  @Column('int')
  quantity: number;
}
