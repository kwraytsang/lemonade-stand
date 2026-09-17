import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { OrderItem } from './order-item.entity';

export enum ContactMethod {
  PHONE = 'phone',
  EMAIL = 'email',
}

@Entity()
@Index(['confirmationNumber', 'orderDate'], { unique: true })
export class Order {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  customerName: string;

  @ApiProperty({ enum: ContactMethod })
  @Column({ type: 'enum', enum: ContactMethod })
  contactMethod: ContactMethod;

  @ApiProperty()
  @Column()
  customerContact: string;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: string;

  @ApiProperty()
  @Column()
  confirmationNumber: string;

  /** The calendar day (server local time) the order was placed on, used to scope confirmationNumber uniqueness so numbers can be reused day to day. */
  @ApiProperty()
  @Column({ type: 'date' })
  orderDate: string;

  @ApiProperty({ type: () => OrderItem, isArray: true })
  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
