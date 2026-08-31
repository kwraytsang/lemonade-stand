import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBeverageTypeDto {
  @ApiProperty({ example: 'Classic Lemonade' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Fresh-squeezed lemons, cane sugar, ice-cold.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
