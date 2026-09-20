import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

import { ContactMethod } from '../entities/order.entity';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ enum: ContactMethod, example: ContactMethod.EMAIL })
  @IsEnum(ContactMethod)
  contactMethod: ContactMethod;

  /** Format (email vs. phone) is checked against `contactMethod` by ZodValidationPipe + contactValidationSchema, applied in OrdersController. */
  @ApiProperty({ example: 'jane@example.com' })
  @IsString()
  @IsNotEmpty()
  customerContact: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
