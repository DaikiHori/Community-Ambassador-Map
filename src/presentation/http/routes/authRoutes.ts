import express from 'express';
import { PassportStatic } from 'passport';

export function createAuthRoutes(passport: PassportStatic): express.Router {
  const router = express.Router();

  router.post('/auth/google', passport.authenticate('google', {
    scope: ['email', 'profile']
  }));

  const googleCallbackHandler = passport.authenticate('google', {
    failureRedirect: '/login-page',
    successRedirect: '/'
  });

  router.get('/auth/google/callback', googleCallbackHandler);
  router.post('/auth/google/callback', googleCallbackHandler);

  router.get('/logout', (request, response) => {
    request.logout(() => {
      response.redirect('/login-page');
    });
  });

  return router;
}
