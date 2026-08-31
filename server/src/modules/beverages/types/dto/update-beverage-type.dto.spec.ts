import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateBeverageTypeDto } from './update-beverage-type.dto';

async function validateDto(payload: object) {
  return validate(plainToInstance(UpdateBeverageTypeDto, payload));
}

describe('UpdateBeverageTypeDto', () => {
  it('passes validation with an empty payload since every field is optional', async () => {
    const errors = await validateDto({});

    expect(errors).toHaveLength(0);
  });

  it('passes validation when only one field is provided', async () => {
    const errors = await validateDto({ description: 'Now with more lemon' });

    expect(errors).toHaveLength(0);
  });

  it('fails validation when a provided field has the wrong type', async () => {
    const errors = await validateDto({ name: 42 });

    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('fails validation when a provided name is an empty string', async () => {
    const errors = await validateDto({ name: '' });

    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});
