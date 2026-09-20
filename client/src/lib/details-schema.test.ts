import { detailsSchema } from './details-schema';

const basePayload = {
  customerName: 'Jane Doe',
  contactMethod: 'email' as const,
  customerContact: 'jane@example.com',
};

describe('detailsSchema', () => {
  it('passes with a valid email', () => {
    const result = detailsSchema.safeParse(basePayload);

    expect(result.success).toBe(true);
  });

  it('passes with a valid phone number', () => {
    const result = detailsSchema.safeParse({
      ...basePayload,
      contactMethod: 'phone',
      customerContact: '(555) 123-4567',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a phone number with too few digits', () => {
    const result = detailsSchema.safeParse({
      ...basePayload,
      contactMethod: 'phone',
      customerContact: '555-12',
    });

    expect(result.success).toBe(false);
  });


  it('rejects an "@"-containing string that is not a real email address', () => {
    const result = detailsSchema.safeParse({
      ...basePayload,
      customerContact: 'jane@example',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a name shorter than 2 characters', () => {
    const result = detailsSchema.safeParse({
      ...basePayload,
      customerName: 'J',
    });

    expect(result.success).toBe(false);
  });
});
