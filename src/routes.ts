import { Router } from 'express';
import { userProfileRoutes } from '~/features/user-profile/user-profile-routes.js';
import { userAuthenticationRoutes } from '~/features/user-authentication/user-authentication-routes.js';

export const apiV1Router = Router();

apiV1Router.use(userAuthenticationRoutes);
apiV1Router.use('/user', userProfileRoutes);
