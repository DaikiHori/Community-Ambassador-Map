import express from 'express';
import { GetActiveLocationsUseCase } from '../../../application/usecases/locations/getActiveLocationsUseCase';
import { GetLocationLeadersUseCase } from '../../../application/usecases/locations/getLocationLeadersUseCase';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

export function createLocationRoutes(
  getActiveLocationsUseCase: GetActiveLocationsUseCase,
  getLocationLeadersUseCase: GetLocationLeadersUseCase
): express.Router {
  const router = express.Router();

  router.get('/api/locations', ensureAuthenticated, async (request, response) => {
    try {
      const result = await getActiveLocationsUseCase.executeAsync();
      response.json(result.locations);
    } catch (error) {
      console.error('Database Error:', error);
      response.status(500).json({
        error: '地点データの取得に失敗しました'
      });
    }
  });

  router.get('/api/locations/:id', ensureAuthenticated, async (request, response) => {
    try {
      const result = await getLocationLeadersUseCase.executeAsync({
        locationGroupId: request.params.id
      });

      response.json(result.leaders);
    } catch (error) {
      console.error('Detail Fetch Error:', error);
      response.status(500).json({
        error: 'リーダー情報の取得に失敗しました'
      });
    }
  });

  return router;
}
