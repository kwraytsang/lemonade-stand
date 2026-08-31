import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BeverageType } from '../../types/entities/beverage-type.entity';

@Entity()
@Check(`"price" > 0`)
export class BeverageSize {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  label: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: string;

  @ManyToOne(() => BeverageType, (beverageType) => beverageType.sizes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'beverageTypeId' })
  beverageType: BeverageType;

  @Column()
  beverageTypeId: string;
}
