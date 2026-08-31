import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateBeverageSizeDto } from './update-beverage-size.dto';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

async function validateDto(payload: object) {
  return validate(plainToInstance(UpdateBeverageSizeDto, payload));
}

describe('UpdateBeverageSizeDto', () => {
  it('passes validation with an empty payload since every field is optional', async () => {
    const errors = await validateDto({});

    expect(errors).toHaveLength(0);
  });

  it('passes validation when only price is provided', async () => {
    const errors = await validateDto({ price: 4 });

    expect(errors).toHaveLength(0);
  });

  it('fails validation when a provided price is not positive', async () => {
    const errors = await validateDto({ price: 0 });

    const priceError = errors.find((e) => e.property === 'price');
    expect(priceError?.constraints).toHaveProperty('isPositive');
  });

  it('fails validation when a provided beverageTypeId is not a valid uuid', async () => {
    const errors = await validateDto({ beverageTypeId: 'not-a-uuid' });

    const idError = errors.find((e) => e.property === 'beverageTypeId');
    expect(idError?.constraints).toHaveProperty('isUuid');
  });

  it('passes validation when a valid uuid is provided for beverageTypeId', async () => {
    const errors = await validateDto({ beverageTypeId: VALID_UUID });

    expect(errors).toHaveLength(0);
  });
});
