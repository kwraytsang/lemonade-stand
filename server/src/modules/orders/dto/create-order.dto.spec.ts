import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ContactMethod } from '../entities/order.entity';
import { CreateOrderDto } from './create-order.dto';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

const validPayload = {
  customerName: 'Jane Doe',
  contactMethod: ContactMethod.EMAIL,
  customerContact: 'jane@example.com',
  items: [{ beverageTypeId: VALID_UUID, sizeId: VALID_UUID, quantity: 2 }],
};

async function validateDto(payload: object) {
  return validate(plainToInstance(CreateOrderDto, payload));
}

describe('CreateOrderDto', () => {
  it('passes validation with a valid payload', async () => {
    const errors = await validateDto(validPayload);

    expect(errors).toHaveLength(0);
  });

  it('fails validation when customerName is missing', async () => {
    const payload: Partial<typeof validPayload> = { ...validPayload };
    delete payload.customerName;
    const errors = await validateDto(payload);

    const error = errors.find((e) => e.property === 'customerName');
    expect(error?.constraints).toHaveProperty('isNotEmpty');
  });

  it('fails validation when contactMethod is not a recognized enum value', async () => {
    const errors = await validateDto({
      ...validPayload,
      contactMethod: 'carrier-pigeon',
    });

    const error = errors.find((e) => e.property === 'contactMethod');
    expect(error?.constraints).toHaveProperty('isEnum');
  });

  it('fails validation when customerContact is missing', async () => {
    const payload: Partial<typeof validPayload> = { ...validPayload };
    delete payload.customerContact;
    const errors = await validateDto(payload);

    const error = errors.find((e) => e.property === 'customerContact');
    expect(error?.constraints).toHaveProperty('isNotEmpty');
  });

  // Whether `customerContact` actually looks like a valid email/phone number for
  // the selected `contactMethod` is checked separately, by ZodValidationPipe +
  // contactValidationSchema (see contact-validation.schema.spec.ts) — this DTO
  // only owns "is a non-empty string".

  it('fails validation when items is an empty array', async () => {
    const errors = await validateDto({ ...validPayload, items: [] });

    const error = errors.find((e) => e.property === 'items');
    expect(error?.constraints).toHaveProperty('arrayMinSize');
  });

  it('fails validation when items is not an array', async () => {
    const errors = await validateDto({
      ...validPayload,
      items: 'one-lemonade-please',
    });

    const error = errors.find((e) => e.property === 'items');
    expect(error?.constraints).toHaveProperty('isArray');
  });

  it('propagates nested validation errors from an invalid item', async () => {
    const errors = await validateDto({
      ...validPayload,
      items: [
        { beverageTypeId: 'not-a-uuid', sizeId: VALID_UUID, quantity: 0 },
      ],
    });

    const itemsError = errors.find((e) => e.property === 'items');
    expect(itemsError?.children).toHaveLength(1);

    const nestedConstraints = itemsError!.children![0].children!.map(
      (c) => c.property,
    );
    expect(nestedConstraints).toEqual(
      expect.arrayContaining(['beverageTypeId', 'quantity']),
    );
  });
});
