import type { Request, Response } from 'express';
import { z } from 'zod';

import { validateBody } from '~/middleware/validate.js';

import {
  retrieveUserProfileFromDatabaseByEmail,
  saveUserProfileToDatabase,
} from '../user-profile/user-profile-model.js';
import {
  clearJwtCookie,
  generateJwtToken,
  getIsPasswordValid,
  hashPassword,
  setJwtCookie,
} from './user-authentication-helpers.js';

export async function login(request: Request, response: Response) {
  const body = await validateBody(
    z.object({
      email: z.email(),
      password: z.string().min(8),
    }),
    request,
    response,
  );

  const user = await retrieveUserProfileFromDatabaseByEmail(body.email);

  if (user) {
    const isPasswordValid = await getIsPasswordValid(
      body.password,
      user.hashedPassword,
    );

    if (isPasswordValid) {
      const token = generateJwtToken(user);
      setJwtCookie(response, token);
      response.status(200).json({ message: 'Logged in successfully' });
    } else {
      response.status(401).json({ message: 'Invalid credentials' });
    }
  } else {
    response.status(401).json({ message: 'Invalid credentials' });
  }
}

export async function register(request: Request, response: Response) {
  const body = await validateBody(
    z.object({
      email: z.email(),
      password: z.string().min(8),
    }),
    request,
    response,
  );

  const existingUser = await retrieveUserProfileFromDatabaseByEmail(body.email);

  if (existingUser) {
    response.status(409).json({ message: 'User already exists' });
  } else {
    const hashedPassword = await hashPassword(body.password);
    const user = await saveUserProfileToDatabase({
      email: body.email,
      hashedPassword,
    });

    const token = generateJwtToken(user);
    setJwtCookie(response, token);

    response.status(201).json({ message: 'User registered successfully' });
  }
}

export async function logout(request: Request, response: Response) {
  clearJwtCookie(response);

  response.status(200).json({ message: 'Logged out successfully' });
}
