import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateBeverageSizeDto {
  @ApiProperty({ example: 'Small' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ example: 2.0 })
  @IsPositive()
  price: number;

  @ApiProperty({ description: 'Id of the beverage type this size belongs to' })
  @IsUUID()
  beverageTypeId: string;
}
