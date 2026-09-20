import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

import { ZodValidationPipe } from './zod-validation.pipe';

const schema = z.object({ name: z.string().min(1) });

describe('ZodValidationPipe', () => {
  it('returns the original value unchanged when it passes the schema', () => {
    const pipe = new ZodValidationPipe(schema);
    const value = { name: 'Jane', extra: 'kept as-is' };

    expect(pipe.transform(value)).toBe(value);
  });

  it('throws a BadRequestException with the schema issue messages when validation fails', () => {
    const pipe = new ZodValidationPipe(schema);

    expect(() => pipe.transform({ name: '' })).toThrow(BadRequestException);
  });
});
