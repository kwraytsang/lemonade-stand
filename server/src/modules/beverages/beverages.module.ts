import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminBeverageSizesController } from './sizes/admin-beverage-sizes.controller';
import { BeverageSize } from './sizes/entities/beverage-size.entity';
import { BeverageSizesController } from './sizes/beverage-sizes.controller';
import { BeverageSizesService } from './sizes/beverage-sizes.service';
import { AdminBeverageTypesController } from './types/admin-beverage-types.controller';
import { BeverageType } from './types/entities/beverage-type.entity';
import { BeverageTypesController } from './types/beverage-types.controller';
import { BeverageTypesService } from './types/beverage-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([BeverageType, BeverageSize])],
  controllers: [
    BeverageTypesController,
    AdminBeverageTypesController,
    BeverageSizesController,
    AdminBeverageSizesController,
  ],
  providers: [BeverageTypesService, BeverageSizesService],
  exports: [BeverageTypesService, BeverageSizesService],
})
export class BeveragesModule {}
