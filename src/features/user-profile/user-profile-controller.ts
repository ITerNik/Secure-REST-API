import type { Request, Response } from 'express';
import { z } from 'zod';

import { requireAuthentication } from '~/middleware/require-authentication.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '~/middleware/validate.js';
import { getErrorMessage } from '~/utils/get-error-message.js';

import {
  deleteUserProfileFromDatabaseById,
  retrieveManyUserProfilesFromDatabase,
  retrieveUserProfileFromDatabaseById,
  updateUserProfileInDatabaseById,
} from './user-profile-model.js';
import { sanitizeSchema } from '~/utils/sanitizer.js';
import type { UserProfile } from '@prisma/client';

function mapper({ name, email }: UserProfile) {
  return { name, email };
}
export async function getAllUserProfiles(request: Request, response: Response) {
  requireAuthentication(request, response);
  const query = await validateQuery(
    z.object({
      page: sanitizeSchema(z.coerce.number().positive().default(1)),
      pageSize: sanitizeSchema(z.coerce.number().positive().default(10)),
    }),
    request,
    response,
  );

  const profiles = await retrieveManyUserProfilesFromDatabase({
    page: query.page,
    pageSize: query.pageSize,
  });

  response.status(200).json(profiles.map(mapper));
}

export async function getUserProfileById(request: Request, response: Response) {
  requireAuthentication(request, response);
  const { id } = await validateParams(
    z.object({ id: sanitizeSchema(z.cuid2()) }),
    request,
    response,
  );
  const profile = await retrieveUserProfileFromDatabaseById(id);

  if (profile) {
    response.status(200).json(mapper(profile));
  } else {
    response.status(404).json({ message: 'Not Found' });
  }
}

export async function updateUserProfile(request: Request, response: Response) {
  requireAuthentication(request, response);
  const { id } = await validateParams(
    z.object({ id: sanitizeSchema(z.cuid2()) }),
    request,
    response,
  );

  const body = await validateBody(
    z.object({
      email: sanitizeSchema(z.email().optional()),
      name: sanitizeSchema(z.string().optional()),
      id: sanitizeSchema(z.never().optional()),
    }),
    request,
    response,
  );

  if (Object.keys(body).length === 0) {
    response.status(400).json({ message: 'No valid fields to update' });
    return;
  }

  if ('id' in body) {
    response.status(400).json({ message: 'ID cannot be updated' });
    return;
  }

  try {
    const updatedProfile = await updateUserProfileInDatabaseById({
      id,
      data: body,
    });
    response.status(200).json(mapper(updatedProfile));
  } catch (error) {
    const message = getErrorMessage(error);

    if (message.includes('No record was found for an update')) {
      response.status(404).json({ message: 'Not Found' });
    } else if (message.includes('Unique constraint failed')) {
      response.status(409).json({ message: 'Profile already exists' });
    } else {
      throw error;
    }
  }
}

export async function deleteUserProfile(request: Request, response: Response) {
  requireAuthentication(request, response);
  const { id } = await validateParams(
    z.object({ id: sanitizeSchema(z.cuid2()) }),
    request,
    response,
  );

  try {
    const deletedProfile = await deleteUserProfileFromDatabaseById(id);
    response.status(200).json(mapper(deletedProfile));
  } catch (error) {
    const message = getErrorMessage(error);

    if (message.includes('No record was found for a delete')) {
      response.status(404).json({ message: 'Not Found' });
    } else {
      throw error;
    }
  }
}
