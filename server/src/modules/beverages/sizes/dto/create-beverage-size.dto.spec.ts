import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateBeverageSizeDto } from './create-beverage-size.dto';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

async function validateDto(payload: object) {
  return validate(plainToInstance(CreateBeverageSizeDto, payload));
}

describe('CreateBeverageSizeDto', () => {
  it('passes validation with a valid payload', async () => {
    const errors = await validateDto({
      label: 'Small',
      price: 2.5,
      beverageTypeId: VALID_UUID,
    });

    expect(errors).toHaveLength(0);
  });

  it('fails validation when label is missing', async () => {
    const errors = await validateDto({
      price: 2.5,
      beverageTypeId: VALID_UUID,
    });

    expect(errors.map((e) => e.property)).toContain('label');
  });

  it('fails validation when label is an empty string', async () => {
    const errors = await validateDto({
      label: '',
      price: 2.5,
      beverageTypeId: VALID_UUID,
    });

    const labelError = errors.find((e) => e.property === 'label');
    expect(labelError?.constraints).toHaveProperty('isNotEmpty');
  });

  it('fails validation when price is missing', async () => {
    const errors = await validateDto({
      label: 'Small',
      beverageTypeId: VALID_UUID,
    });

    const priceError = errors.find((e) => e.property === 'price');
    expect(priceError?.constraints).toHaveProperty('isPositive');
  });

  it('fails validation when price is zero', async () => {
    const errors = await validateDto({
      label: 'Small',
      price: 0,
      beverageTypeId: VALID_UUID,
    });

    const priceError = errors.find((e) => e.property === 'price');
    expect(priceError?.constraints).toHaveProperty('isPositive');
  });

  it('fails validation when price is negative', async () => {
    const errors = await validateDto({
      label: 'Small',
      price: -5,
      beverageTypeId: VALID_UUID,
    });

    const priceError = errors.find((e) => e.property === 'price');
    expect(priceError?.constraints).toHaveProperty('isPositive');
  });

  it('fails validation when beverageTypeId is missing', async () => {
    const errors = await validateDto({ label: 'Small', price: 2.5 });

    const idError = errors.find((e) => e.property === 'beverageTypeId');
    expect(idError?.constraints).toHaveProperty('isUuid');
  });

  it('fails validation when beverageTypeId is not a valid uuid', async () => {
    const errors = await validateDto({
      label: 'Small',
      price: 2.5,
      beverageTypeId: 'not-a-uuid',
    });

    const idError = errors.find((e) => e.property === 'beverageTypeId');
    expect(idError?.constraints).toHaveProperty('isUuid');
  });
});
