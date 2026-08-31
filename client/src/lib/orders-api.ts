import { apiClient } from './api-client';
import { CartItem, ContactMethod } from '@/types/order';

type SubmitOrderInput = {
  customerName: string;
  contactMethod: ContactMethod;
  customerContact: string;
  items: CartItem[];
};

type SubmitOrderResponse = {
  confirmationNumber: string;
};

export async function submitOrder(input: SubmitOrderInput): Promise<SubmitOrderResponse> {
  return apiClient.post<SubmitOrderResponse>('/customer/orders', {
    customerName: input.customerName,
    contactMethod: input.contactMethod,
    customerContact: input.customerContact,
    items: input.items.map((item) => ({
      beverageTypeId: item.beverageId,
      sizeId: item.sizeId,
      quantity: item.quantity,
    })),
  });
}
