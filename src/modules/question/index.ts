import { Router } from "express"
import { questionRouter } from "./routes/routes";

const QuestionModule = Router()

QuestionModule.use("/question",questionRouter)

export {QuestionModule};