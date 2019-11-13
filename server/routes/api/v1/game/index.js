import express from 'express';

import {
  gameNameController,
  gameIdController,
  getPopularGamesController,
  getRandomGamesController
} from '../../../../controllers/gameController';

const gameRouter = express.Router();

gameRouter.get('/name/:name', gameNameController);
gameRouter.get('/id/:id', gameIdController);
gameRouter.get('/popular', getPopularGamesController);
gameRouter.get('/random', getRandomGamesController);

export default gameRouter;
