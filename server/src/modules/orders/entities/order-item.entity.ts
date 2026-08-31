import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Order } from './order.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  orderId: string;

  @Column()
  beverageTypeId: string;

  @Column()
  beverageName: string;

  @Column()
  sizeId: string;

  @Column()
  sizeLabel: string;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: string;

  @Column('int')
  quantity: number;
}
