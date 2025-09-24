import type {Prisma, UserProfile} from "@prisma/client";
import { prisma } from '~/database.js';

export async function saveUserProfileToDatabase(
  userProfile: Prisma.UserProfileCreateInput,
) {
  return prisma.userProfile.create({ data: userProfile });
}

export async function retrieveUserProfileFromDatabaseById(
  id: UserProfile['id'],
) {
  return prisma.userProfile.findUnique({ where: { id } });
}

export async function retrieveUserProfileFromDatabaseByEmail(
  email: UserProfile['email'],
) {
  return prisma.userProfile.findUnique({ where: { email } });
}

export async function retrieveManyUserProfilesFromDatabase({
  page = 1,
  pageSize = 10,
}: {
  page?: number;
  pageSize?: number;
}) {
  const skip = (page - 1) * pageSize;
  return prisma.userProfile.findMany({
    skip,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateUserProfileInDatabaseById({
  id,
  data,
}: {
  id: UserProfile['id'];
  data: Prisma.UserProfileUpdateInput;
}) {
  return prisma.userProfile.update({ where: { id }, data });
}

export async function deleteUserProfileFromDatabaseById(id: UserProfile['id']) {
  return prisma.userProfile.delete({ where: { id } });
}
