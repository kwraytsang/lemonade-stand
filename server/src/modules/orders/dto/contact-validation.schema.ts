import { z } from 'zod';

import { ContactMethod } from '../entities/order.entity';

/**
 * Mirrors the client's equivalent schema (client/src/lib/details-schema.ts):
 * same zod `.email()` check for the email branch, same 7-digit minimum for the
 * phone branch. Keep the two in sync until this rule is derived from a single
 * shared source.
 */
const MIN_PHONE_DIGITS = 7;
const emailSchema = z.email();

export const contactValidationSchema = z
  .object({
    contactMethod: z.enum(ContactMethod),
    customerContact: z.string(),
  })
  .superRefine((data, ctx) => {
    const valid =
      data.contactMethod === ContactMethod.EMAIL
        ? emailSchema.safeParse(data.customerContact).success
        : data.customerContact.replace(/\D/g, '').length >= MIN_PHONE_DIGITS;
    if (!valid) {
      ctx.addIssue({
        code: 'custom',
        path: ['customerContact'],
        message:
          data.contactMethod === ContactMethod.EMAIL
            ? 'customerContact must be a valid email address'
            : 'customerContact must be a valid phone number',
      });
    }
  });
