import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateOrderItemDto } from './create-order-item.dto';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

async function validateDto(payload: object) {
  return validate(plainToInstance(CreateOrderItemDto, payload));
}

describe('CreateOrderItemDto', () => {
  it('passes validation with a valid payload', async () => {
    const errors = await validateDto({
      beverageTypeId: VALID_UUID,
      sizeId: VALID_UUID,
      quantity: 2,
    });

    expect(errors).toHaveLength(0);
  });

  it('fails validation when beverageTypeId is not a valid uuid', async () => {
    const errors = await validateDto({
      beverageTypeId: 'not-a-uuid',
      sizeId: VALID_UUID,
      quantity: 1,
    });

    const error = errors.find((e) => e.property === 'beverageTypeId');
    expect(error?.constraints).toHaveProperty('isUuid');
  });

  it('fails validation when sizeId is not a valid uuid', async () => {
    const errors = await validateDto({
      beverageTypeId: VALID_UUID,
      sizeId: 'not-a-uuid',
      quantity: 1,
    });

    const error = errors.find((e) => e.property === 'sizeId');
    expect(error?.constraints).toHaveProperty('isUuid');
  });

  it('fails validation when quantity is not an integer', async () => {
    const errors = await validateDto({
      beverageTypeId: VALID_UUID,
      sizeId: VALID_UUID,
      quantity: 1.5,
    });

    const error = errors.find((e) => e.property === 'quantity');
    expect(error?.constraints).toHaveProperty('isInt');
  });

  it('fails validation when quantity is zero', async () => {
    const errors = await validateDto({
      beverageTypeId: VALID_UUID,
      sizeId: VALID_UUID,
      quantity: 0,
    });

    const error = errors.find((e) => e.property === 'quantity');
    expect(error?.constraints).toHaveProperty('isPositive');
  });

  it('fails validation when quantity is negative', async () => {
    const errors = await validateDto({
      beverageTypeId: VALID_UUID,
      sizeId: VALID_UUID,
      quantity: -3,
    });

    const error = errors.find((e) => e.property === 'quantity');
    expect(error?.constraints).toHaveProperty('isPositive');
  });
});
