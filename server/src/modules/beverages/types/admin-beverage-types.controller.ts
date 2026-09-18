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
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { BeverageTypesService } from './beverage-types.service';
import { CreateBeverageTypeDto } from './dto/create-beverage-type.dto';
import { UpdateBeverageTypeDto } from './dto/update-beverage-type.dto';
import { BeverageType } from './entities/beverage-type.entity';

@ApiTags('admin/beverage-types')
@Controller('admin/beverage-types')
export class AdminBeverageTypesController {
  constructor(private readonly beverageTypesService: BeverageTypesService) {}

  @Get()
  @ApiOkResponse({ type: BeverageType, isArray: true })
  findAll(): Promise<BeverageType[]> {
    return this.beverageTypesService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: BeverageType })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<BeverageType> {
    return this.beverageTypesService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: BeverageType })
  create(@Body() dto: CreateBeverageTypeDto): Promise<BeverageType> {
    return this.beverageTypesService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: BeverageType })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBeverageTypeDto,
  ): Promise<BeverageType> {
    return this.beverageTypesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.beverageTypesService.remove(id);
  }
}
