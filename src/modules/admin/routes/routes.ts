import { Router, Request, Response } from "express"; // Import the Request and Response types
import { AdminController } from "../controllers/admin.controller";
import { upload } from '../config/multer.config'; // Import the Multer configuration

const adminRouter = Router();
const adminController = new AdminController();

adminRouter.post('/upload', upload.single('file'), (req, res) => adminController.saveQuestions(req, res));
adminRouter.post('/leaderboard/event/:emsEventId', (req, res) => adminController.generateEventLeaderboard(req, res));
adminRouter.post('/leaderboard/slots', (req, res) => adminController.generateSlotsLeaderboard(req, res));
adminRouter.post('/fetchEvents', (req, res) => adminController.fetchEvents(req, res));
adminRouter.post('/fetchSlots/:emsEventId', (req, res) => adminController.fetchSlots(req, res));
adminRouter.get('/events', (req, res) => adminController.getEvents(req, res));
adminRouter.get('/slots/:emsEventId', (req, res) => adminController.getSlots(req, res));
adminRouter.get('/questions/:emsEventId', (req, res) => adminController.getQuestions(req, res));
export { adminRouter };