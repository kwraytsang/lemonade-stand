import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { BeverageSizesService } from './beverage-sizes.service';
import { BeverageSize } from './entities/beverage-size.entity';

@ApiTags('customer/beverage-sizes')
@Controller('customer/beverage-sizes')
export class BeverageSizesController {
  constructor(private readonly beverageSizesService: BeverageSizesService) {}

  @Get()
  @ApiOkResponse({ type: BeverageSize, isArray: true })
  findAll(): Promise<BeverageSize[]> {
    return this.beverageSizesService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: BeverageSize })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<BeverageSize> {
    return this.beverageSizesService.findOne(id);
  }
}
