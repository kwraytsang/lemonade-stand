import { apiClient } from './api-client';
import { BeverageType } from '@/types/beverage';

type RawBeverageSize = {
  id: string;
  label: string;
  price: string;
  beverageTypeId: string;
};

type RawBeverageType = {
  id: string;
  name: string;
  description: string | null;
  sizes: RawBeverageSize[];
};

function toBeverageType(raw: RawBeverageType): BeverageType {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? undefined,
    sizes: raw.sizes.map((size) => ({
      id: size.id,
      label: size.label,
      price: Number(size.price),
    })),
  };
}

export async function fetchBeverageTypes(): Promise<BeverageType[]> {
  const raw = await apiClient.get<RawBeverageType[]>('/customer/beverage-types');
  return raw.map(toBeverageType);
}
