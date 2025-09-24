import type { Request, Response } from 'express';

import { getJwtTokenFromCookie } from '~/features/user-authentication/user-authentication-helpers.js';

export function requireAuthentication(request: Request, response: Response) {
  try {
    return getJwtTokenFromCookie(request);
  } catch {
    throw response.status(401).json({ message: 'Unauthorized' });
  }
}
