import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { BeverageSize } from '../../sizes/entities/beverage-size.entity';

@Entity()
export class BeverageType {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  name: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({ type: () => BeverageSize, isArray: true })
  @OneToMany(() => BeverageSize, (size) => size.beverageType, { cascade: true })
  sizes: BeverageSize[];
}
