import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { BeverageTypesService } from './modules/beverages/types/beverage-types.service';
import { BeverageSizesService } from './modules/beverages/sizes/beverage-sizes.service';

/**
 * Seeds a handful of sample beverage types/sizes through the same services the
 * admin API uses, so the data goes through the usual validation. One type
 * ("Seasonal Special") is deliberately left without any sizes to exercise the
 * "orderable" filter on the customer-facing beverage-types endpoint.
 */
async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const beverageTypes = app.get(BeverageTypesService);
  const beverageSizes = app.get(BeverageSizesService);

  const menu = [
    {
      name: 'Classic Lemonade',
      description: 'Fresh-squeezed lemons, cane sugar, ice-cold.',
      sizes: [
        { label: 'Small', price: 2.5 },
        { label: 'Medium', price: 3.5 },
        { label: 'Large', price: 4.5 },
      ],
    },
    {
      name: 'Strawberry Fizz',
      description: 'Lemonade with muddled strawberries and a splash of soda.',
      sizes: [
        { label: 'Small', price: 3.0 },
        { label: 'Medium', price: 4.0 },
        { label: 'Large', price: 5.0 },
      ],
    },
    {
      name: 'Iced Tea',
      description: 'Black tea brewed strong, served over ice.',
      sizes: [
        { label: 'Small', price: 2.0 },
        { label: 'Medium', price: 3.0 },
        { label: 'Large', price: 4.0 },
      ],
    },
    {
      // No sizes yet — should NOT show up in the customer-facing beverage-types
      // list, but should still be visible/manageable through the admin API.
      name: 'Seasonal Special',
      description: 'Coming soon — pricing not finalized yet.',
      sizes: [],
    },
  ];

  for (const item of menu) {
    const type = await beverageTypes.create({
      name: item.name,
      description: item.description,
    });

    for (const size of item.sizes) {
      await beverageSizes.create({
        label: size.label,
        price: size.price,
        beverageTypeId: type.id,
      });
    }

    console.log(
      `Seeded "${item.name}" with ${item.sizes.length} size(s)${item.sizes.length === 0 ? ' (no price yet)' : ''}.`,
    );
  }

  await app.close();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
