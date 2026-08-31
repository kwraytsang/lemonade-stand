import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { OrderItem } from './order-item.entity';

export enum ContactMethod {
  PHONE = 'phone',
  EMAIL = 'email',
}

@Entity()
@Index(['confirmationNumber', 'orderDate'], { unique: true })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerName: string;

  @Column({ type: 'enum', enum: ContactMethod })
  contactMethod: ContactMethod;

  @Column()
  customerContact: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: string;

  @Column()
  confirmationNumber: string;

  /** The calendar day (server local time) the order was placed on, used to scope confirmationNumber uniqueness so numbers can be reused day to day. */
  @Column({ type: 'date' })
  orderDate: string;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;
}
