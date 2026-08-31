export type BeverageSize = {
  id: string;
  label: string;
  price: number;
};

export type BeverageType = {
  id: string;
  name: string;
  description?: string;
  sizes: BeverageSize[];
};
