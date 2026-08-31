import {
  isEmail,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

import { ContactMethod } from '../entities/order.entity';

const MIN_PHONE_DIGITS = 7;

function isValidPhone(value: string): boolean {
  return value.replace(/\D/g, '').length >= MIN_PHONE_DIGITS;
}

/** Validates that `customerContact` is a well-formed email or phone number, depending on the sibling `contactMethod` field. */
export function MatchesContactMethod(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'matchesContactMethod',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          const { contactMethod } = args.object as {
            contactMethod?: ContactMethod;
          };
          return contactMethod === ContactMethod.PHONE
            ? isValidPhone(value)
            : isEmail(value);
        },
        defaultMessage(args: ValidationArguments) {
          const { contactMethod } = args.object as {
            contactMethod?: ContactMethod;
          };
          return contactMethod === ContactMethod.PHONE
            ? 'customerContact must be a valid phone number'
            : 'customerContact must be a valid email address';
        },
      },
    });
  };
}
