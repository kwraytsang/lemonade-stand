import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { BeverageSizesService } from './beverage-sizes.service';

@ApiTags('customer/beverage-sizes')
@Controller('customer/beverage-sizes')
export class BeverageSizesController {
  constructor(private readonly beverageSizesService: BeverageSizesService) {}

  @Get()
  findAll() {
    return this.beverageSizesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.beverageSizesService.findOne(id);
  }
}
