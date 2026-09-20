import { z } from 'zod';

/**
 * Mirrors the server's contactValidationSchema (server/src/modules/orders/dto/contact-validation.schema.ts):
 * same zod `.email()` check for the email branch, same 7-digit minimum for the phone branch.
 * Keep the two in sync until this rule is derived from a single shared source.
 */
const MIN_PHONE_DIGITS = 7;
const emailSchema = z.email();

export const detailsSchema = z
  .object({
    customerName: z.string().trim().min(2, 'Enter your name.'),
    contactMethod: z.enum(['phone', 'email']),
    customerContact: z.string(),
  })
  .superRefine((data, ctx) => {
    const valid =
      data.contactMethod === 'email'
        ? emailSchema.safeParse(data.customerContact).success
        : data.customerContact.replace(/\D/g, '').length >= MIN_PHONE_DIGITS;
    if (!valid) {
      ctx.addIssue({
        code: 'custom',
        path: ['customerContact'],
        message:
          data.contactMethod === 'email'
            ? 'Enter a valid email address.'
            : 'Enter a valid phone number.',
      });
    }
  });

export type DetailsFormValues = z.infer<typeof detailsSchema>;
