import { ACTION_LEVELS, ZodXssSanitizer } from 'zod-xss-sanitizer';

export async function sanitizeSchema(val: any) {
    const result = ZodXssSanitizer.sanitizer({
        actionLevel: ACTION_LEVELS.VALIDATE,
    }).safeParse(val);
}
