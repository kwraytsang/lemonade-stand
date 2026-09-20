import { BadRequestException, PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

/**
 * Validates the raw request value against a zod schema without transforming it —
 * class-validator's global ValidationPipe remains the source of truth for shape
 * and type coercion; this only adds checks zod expresses more naturally
 * (e.g. cross-field rules via `.superRefine()`).
 */
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues.map((issue) => issue.message),
      );
    }
    return value;
  }
}
