import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { BeverageTypesService } from './beverage-types.service';

@ApiTags('customer/beverage-types')
@Controller('customer/beverage-types')
export class BeverageTypesController {
  constructor(private readonly beverageTypesService: BeverageTypesService) {}

  @Get()
  findAll() {
    return this.beverageTypesService.findAllOrderable();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.beverageTypesService.findOne(id);
  }
}
