import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { BeverageType } from '../../types/entities/beverage-type.entity';

@Entity()
@Check(`"price" > 0`)
export class BeverageSize {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  label: string;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  price: string;

  @ApiProperty({ type: () => BeverageType })
  @ManyToOne(() => BeverageType, (beverageType) => beverageType.sizes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'beverageTypeId' })
  beverageType: BeverageType;

  @ApiProperty()
  @Column()
  beverageTypeId: string;
}
