import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

@ApiTags('admin/orders')
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOkResponse({ type: Order, isArray: true })
  findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }
}
