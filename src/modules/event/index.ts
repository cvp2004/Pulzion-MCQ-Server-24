import { Router } from "express"
import { eventRouter } from "./routes/routes";

const EventModule = Router()

EventModule.use("/event", eventRouter)

export { EventModule };