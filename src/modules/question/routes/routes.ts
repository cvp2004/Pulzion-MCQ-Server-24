import { Router } from "express";
import { QuestionController } from "../controllers/question.controller";
const isAuthenticated = require('../../user/middlewares/user.middleware');

const questionRouter=Router();
const questionController = new QuestionController();

questionRouter.get("/getsingle/:id", (req, res) => questionController.getQuestion(req, res));
questionRouter.patch("/update/:id", (req, res) => questionController.updateAnswer(req, res));
questionRouter.get("/currentTime", (req, res) => questionController.getCurrentTime(req, res));
questionRouter.get("/ding", (eq, res) => res.send("dong"))

export{questionRouter};