import { Router } from "express";
import { EventController } from "../controllers/event.controller";
const isAuthenticated = require('../../user/middlewares/user.middleware');

const eventController = new EventController();

const eventRouter = Router();

eventRouter.get('/list', (req, res) => eventController.getUserEvents(req, res));
eventRouter.get('/get', (req, res) => eventController.getUserEventById(req, res));
eventRouter.post('/submit/:eventId', (req, res) => eventController.submitEvent(req, res)); // to be Implemented

export { eventRouter as eventRouter };