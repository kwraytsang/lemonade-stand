import { ContactMethod } from '../entities/order.entity';
import { contactValidationSchema } from './contact-validation.schema';

describe('contactValidationSchema', () => {
  it('passes with a valid email', () => {
    const result = contactValidationSchema.safeParse({
      contactMethod: ContactMethod.EMAIL,
      customerContact: 'jane@example.com',
    });

    expect(result.success).toBe(true);
  });

  it('passes with a valid phone number', () => {
    const result = contactValidationSchema.safeParse({
      contactMethod: ContactMethod.PHONE,
      customerContact: '(555) 123-4567',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a phone number with too few digits', () => {
    const result = contactValidationSchema.safeParse({
      contactMethod: ContactMethod.PHONE,
      customerContact: '555-12',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a plainly invalid email', () => {
    const result = contactValidationSchema.safeParse({
      contactMethod: ContactMethod.EMAIL,
      customerContact: 'not-an-email',
    });

    expect(result.success).toBe(false);
  });

  // Regression case shared with the client's equivalent test
  // (client/src/lib/details-schema.test.ts): this string contains an "@" but has
  // no TLD, so it isn't a real email address.
  it('rejects an "@"-containing string that is not a real email address', () => {
    const result = contactValidationSchema.safeParse({
      contactMethod: ContactMethod.EMAIL,
      customerContact: 'jane@example',
    });

    expect(result.success).toBe(false);
  });
});
