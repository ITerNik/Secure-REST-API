import { ACTION_LEVELS, ZodXssSanitizer } from 'zod-xss-sanitizer';
import type { ZodTypeAny } from 'zod/v3';

export function sanitizeSchema(schema: ZodTypeAny) {
  return ZodXssSanitizer.sanitizer({
    actionLevel: ACTION_LEVELS.SANITIZE,
  }).and(schema);
}
