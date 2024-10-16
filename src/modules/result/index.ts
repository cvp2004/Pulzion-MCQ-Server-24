import { Router } from "express"
import { resultRouter } from "./routes/routes";

const ResultModule = Router()

ResultModule.use("/result", resultRouter)

export { ResultModule };