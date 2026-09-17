import type { BeverageType as ApiBeverageType } from './api/generated/lemonadeStandAPI.schemas';
import { BeverageType } from '@/types/beverage';

export function toBeverageType(raw: ApiBeverageType): BeverageType {
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
