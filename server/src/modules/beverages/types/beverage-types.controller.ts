import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { BeverageTypesService } from './beverage-types.service';
import { BeverageType } from './entities/beverage-type.entity';

@ApiTags('customer/beverage-types')
@Controller('customer/beverage-types')
export class BeverageTypesController {
  constructor(private readonly beverageTypesService: BeverageTypesService) {}

  @Get()
  @ApiOkResponse({ type: BeverageType, isArray: true })
  findAll(): Promise<BeverageType[]> {
    return this.beverageTypesService.findAllOrderable();
  }

  @Get(':id')
  @ApiOkResponse({ type: BeverageType })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<BeverageType> {
    return this.beverageTypesService.findOne(id);
  }
}
