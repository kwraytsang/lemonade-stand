import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { BeverageSizesService } from './beverage-sizes.service';
import { CreateBeverageSizeDto } from './dto/create-beverage-size.dto';
import { UpdateBeverageSizeDto } from './dto/update-beverage-size.dto';

@ApiTags('admin/beverage-sizes')
@Controller('admin/beverage-sizes')
export class AdminBeverageSizesController {
  constructor(private readonly beverageSizesService: BeverageSizesService) {}

  @Get()
  findAll() {
    return this.beverageSizesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.beverageSizesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBeverageSizeDto) {
    return this.beverageSizesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBeverageSizeDto,
  ) {
    return this.beverageSizesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.beverageSizesService.remove(id);
  }
}
