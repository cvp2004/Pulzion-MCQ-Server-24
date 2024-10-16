import express from 'express';
import { TestController } from '../controllers/test.controller';

export const testRouter = express.Router();
const testController = new TestController();

// Create a new user test
testRouter.post('/createtest/:userId/questions/:eventId', testController.createUserTest);
testRouter.post("/submitTest/:testId", testController.submitTest);
export default testRouter;
