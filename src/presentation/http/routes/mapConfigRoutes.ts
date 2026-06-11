import express from 'express';
import { GetMapConfigUseCase } from '../../../application/usecases/map/getMapConfigUseCase';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

export function createMapConfigRoutes(getMapConfigUseCase: GetMapConfigUseCase): express.Router {
  const router = express.Router();

  router.get('/api/map-config', ensureAuthenticated, (request, response) => {
    response.json(getMapConfigUseCase.execute());
  });

  return router;
}
