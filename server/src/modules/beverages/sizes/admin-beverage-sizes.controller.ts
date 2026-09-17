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

import { BeverageSizesService } from './beverage-sizes.service';
import { CreateBeverageSizeDto } from './dto/create-beverage-size.dto';
import { UpdateBeverageSizeDto } from './dto/update-beverage-size.dto';
import { BeverageSize } from './entities/beverage-size.entity';

@ApiTags('admin/beverage-sizes')
@Controller('admin/beverage-sizes')
export class AdminBeverageSizesController {
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

  @Post()
  @ApiCreatedResponse({ type: BeverageSize })
  create(@Body() dto: CreateBeverageSizeDto): Promise<BeverageSize> {
    return this.beverageSizesService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: BeverageSize })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBeverageSizeDto,
  ): Promise<BeverageSize> {
    return this.beverageSizesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.beverageSizesService.remove(id);
  }
}
