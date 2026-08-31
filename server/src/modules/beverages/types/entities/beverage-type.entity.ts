import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { BeverageSize } from '../../sizes/entities/beverage-size.entity';

@Entity()
export class BeverageType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => BeverageSize, (size) => size.beverageType, { cascade: true })
  sizes: BeverageSize[];
}
