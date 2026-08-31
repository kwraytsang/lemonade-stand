import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'Id of the beverage type' })
  @IsUUID()
  beverageTypeId: string;

  @ApiProperty({ description: 'Id of the chosen size' })
  @IsUUID()
  sizeId: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  quantity: number;
}
