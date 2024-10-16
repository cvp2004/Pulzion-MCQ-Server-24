import { Router } from "express"
import { testRouter } from "./routes/routes";

const TestModule = Router()

TestModule.use("/test", testRouter)

export { TestModule };