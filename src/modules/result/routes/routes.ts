import express from 'express';
import { ResultController } from '../controllers/result.controller';

export const resultRouter = express.Router();
const resultController = new ResultController();

// Route to calculate the test score
resultRouter.post('/calculate', resultController.calculateScore);
// resultRouter.get('/test-ids/:eventId', resultController.getTestIdsBySlot);

export default resultRouter;
