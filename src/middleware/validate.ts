import type { Request, Response } from 'express';
import type { ZodType } from 'zod';
import { ZodError } from 'zod';

export function createValidate(key: 'body' | 'query' | 'params') {
  return async function validate<T>(
    schema: ZodType<T>,
    request: Request,
    response: Response,
  ): Promise<T> {
    try {
      const result = await schema.safeParseAsync(request[key]);
      return result;
    } catch (error) {
      if (error instanceof ZodError) {
        response
          .status(400)
          .json({ message: 'Bad Request', errors: error.issues });
        throw new Error('Validation failed');
      }
      throw error;
    }
  };
}

export const validateBody = createValidate('body');
export const validateQuery = createValidate('query');
export const validateParams = createValidate('params');
