export type CartItem = {
  beverageId: string;
  beverageName: string;
  sizeId: string;
  sizeLabel: string;
  unitPrice: number;
  quantity: number;
};

export type ContactMethod = 'phone' | 'email';
