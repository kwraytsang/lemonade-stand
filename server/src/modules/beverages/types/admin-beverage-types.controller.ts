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

import { BeverageTypesService } from './beverage-types.service';
import { CreateBeverageTypeDto } from './dto/create-beverage-type.dto';
import { UpdateBeverageTypeDto } from './dto/update-beverage-type.dto';

@ApiTags('admin/beverage-types')
@Controller('admin/beverage-types')
export class AdminBeverageTypesController {
  constructor(private readonly beverageTypesService: BeverageTypesService) {}

  @Get()
  findAll() {
    return this.beverageTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.beverageTypesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBeverageTypeDto) {
    return this.beverageTypesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBeverageTypeDto,
  ) {
    return this.beverageTypesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.beverageTypesService.remove(id);
  }
}
