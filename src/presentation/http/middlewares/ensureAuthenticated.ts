import { NextFunction, Request, Response } from 'express';

export function ensureAuthenticated(request: Request, response: Response, next: NextFunction): void {
  if (request.isAuthenticated()) {
    next();
    return;
  }

  response.redirect('/login-page');
}
