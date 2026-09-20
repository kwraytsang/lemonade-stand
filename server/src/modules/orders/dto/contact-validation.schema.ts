import { z } from 'zod';

import { ContactMethod } from '../entities/order.entity';


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
