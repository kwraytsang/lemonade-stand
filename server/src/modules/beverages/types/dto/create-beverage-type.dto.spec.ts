import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateBeverageTypeDto } from './create-beverage-type.dto';

async function validateDto(payload: object) {
  return validate(plainToInstance(CreateBeverageTypeDto, payload));
}

describe('CreateBeverageTypeDto', () => {
  it('passes validation with a full valid payload', async () => {
    const errors = await validateDto({
      name: 'Classic Lemonade',
      description: 'Fresh-squeezed.',
    });

    expect(errors).toHaveLength(0);
  });

  it('passes validation when the optional description is omitted', async () => {
    const errors = await validateDto({ name: 'Classic Lemonade' });

    expect(errors).toHaveLength(0);
  });

  it('fails validation when name is missing', async () => {
    const errors = await validateDto({});

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('fails validation when name is an empty string', async () => {
    const errors = await validateDto({ name: '' });

    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('fails validation when name is not a string', async () => {
    const errors = await validateDto({ name: 123 });

    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('fails validation when description is not a string', async () => {
    const errors = await validateDto({ name: 'Iced Tea', description: 42 });

    expect(errors[0].property).toBe('description');
    expect(errors[0].constraints).toHaveProperty('isString');
  });
});
