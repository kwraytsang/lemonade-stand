import type { CreateOrderDto } from './api/generated/lemonadeStandAPI.schemas';
import { CartItem, ContactMethod } from '@/types/order';

export type PlaceOrderInput = {
  customerName: string;
  contactMethod: ContactMethod;
  customerContact: string;
  items: CartItem[];
};

export function toCreateOrderDto(input: PlaceOrderInput): CreateOrderDto {
  return {
    customerName: input.customerName,
    contactMethod: input.contactMethod,
    customerContact: input.customerContact,
    items: input.items.map((item) => ({
      beverageTypeId: item.beverageId,
      sizeId: item.sizeId,
      quantity: item.quantity,
    })),
  };
}
