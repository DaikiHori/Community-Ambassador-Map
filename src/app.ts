import express from 'express';
import session from 'express-session';
import passport from 'passport';

import { ApplicationConfig } from './config/applicationConfig';
import { createLibsqlClient } from './infrastructure/database/libsqlClient';
import { LibsqlLocationRepository } from './infrastructure/repositories/libsqlLocationRepository';
import { LibsqlUserRepository } from './infrastructure/repositories/libsqlUserRepository';
import { AuthenticateGoogleUserUseCase } from './application/usecases/auth/authenticateGoogleUserUseCase';
import { FindUserByEmailUseCase } from './application/usecases/auth/findUserByEmailUseCase';
import { GetActiveLocationsUseCase } from './application/usecases/locations/getActiveLocationsUseCase';
import { GetLocationLeadersUseCase } from './application/usecases/locations/getLocationLeadersUseCase';
import { GetMapConfigUseCase } from './application/usecases/map/getMapConfigUseCase';
import { configurePassport } from './presentation/auth/passportConfig';
import { createAuthRoutes } from './presentation/http/routes/authRoutes';
import { createLocationRoutes } from './presentation/http/routes/locationRoutes';
import { createMapConfigRoutes } from './presentation/http/routes/mapConfigRoutes';
import { createPageRoutes } from './presentation/http/routes/pageRoutes';

export function createApp(applicationConfig: ApplicationConfig): express.Express {
  const app = express();
  const libsqlClient = createLibsqlClient(applicationConfig);

  const userRepository = new LibsqlUserRepository(libsqlClient);
  const locationRepository = new LibsqlLocationRepository(libsqlClient);

  const authenticateGoogleUserUseCase = new AuthenticateGoogleUserUseCase(userRepository);
  const findUserByEmailUseCase = new FindUserByEmailUseCase(userRepository);
  const getActiveLocationsUseCase = new GetActiveLocationsUseCase(locationRepository);
  const getLocationLeadersUseCase = new GetLocationLeadersUseCase(locationRepository);
  const getMapConfigUseCase = new GetMapConfigUseCase(applicationConfig);

  if (applicationConfig.isProduction) {
    app.set('trust proxy', 1);
  }

  app.use(session({
    secret: applicationConfig.sessionSecret,
    resave: false,
    saveUninitialized: false,
    proxy: applicationConfig.isProduction,
    cookie: {
      secure: applicationConfig.isProduction,
      sameSite: applicationConfig.isProduction ? 'lax' : 'none',
      maxAge: 24 * 60 * 60 * 1000
    }
  }));

  configurePassport({
    passport,
    applicationConfig,
    authenticateGoogleUserUseCase,
    findUserByEmailUseCase
  });

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.urlencoded({ extended: true }));

  app.use(createAuthRoutes(passport));
  app.use(createPageRoutes(applicationConfig));
  app.use(createLocationRoutes(getActiveLocationsUseCase, getLocationLeadersUseCase));
  app.use(createMapConfigRoutes(getMapConfigUseCase));
  app.use(express.static('public'));

  return app;
}
