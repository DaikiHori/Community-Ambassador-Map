import express from 'express';
import fs from 'fs';
import path from 'path';
import { ApplicationConfig } from '../../../config/applicationConfig';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

export function createPageRoutes(applicationConfig: ApplicationConfig): express.Router {
  const router = express.Router();

  router.get('/', ensureAuthenticated, (request, response) => {
    response.sendFile(path.join(process.cwd(), 'public', 'index.html'));
  });

  router.get('/login-page', (request, response) => {
    let html = fs.readFileSync(
      path.join(process.cwd(), 'public', 'login.html'),
      'utf8'
    );

    html = html.replace('{{GOOGLE_CLIENT_ID}}', applicationConfig.googleClientId);
    html = html.replace(
      '{{CALLBACK_URL}}',
      `${applicationConfig.baseUrl}/auth/google/callback`
    );

    response.send(html);
  });

  return router;
}
