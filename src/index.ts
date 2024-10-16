import express, { Express, Request, Response } from "express";
import http from "http";
import cors from "cors";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { UserModule } from "./modules/user";
import { AdminModule } from "./modules/admin";
import { TestModule } from "./modules/test";
import { QuestionModule } from "./modules/question";
import { EventModule } from "./modules/event";
import { ResultModule } from "./modules/result";
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import cron from "node-cron";
//import { Worker } from "./modules/question/worker/question.worker";
import { client, client as redisClient, connectRedis } from "./database/redis/Redis";

// Load environment variables
dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

// Swagger setup
const swaggerFilePath = path.join(__dirname, '../src/swagger.yaml');
const swaggerDocument = YAML.load(swaggerFilePath);

async function initializeApp() {
    app.use(express.json());
    app.use(cors());
    app.set('PORT', process.env.PORT || 3000);
    app.set("BASE_URL", process.env.BASE_URL || "localhost");

    app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use('/api', UserModule, AdminModule);
    app.use('/api/t', TestModule);
    app.use('/api/u', UserModule);
    app.use('/api/q', QuestionModule);
    app.use('/api/e', EventModule);
    app.use('/api/r', ResultModule);

    app.get('/health', async (req: Request, res: Response) => {
        try {
            await prisma.$queryRaw`SELECT 1;`;
            res.status(200).send("Hello");
        } catch (err: any) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        }
    });
}

async function initializeDatabase() {
    try {
        await prisma.$queryRaw`SELECT 1;`;
        console.log("Database connection successful");
    } catch (error) {
        console.error("Error connecting to the database:", error);
        throw error;
    }
}
async function initializeRedis() {
    try {
      await connectRedis();
      console.log('Connected to Redis');
    } catch (error) {
      console.error("Error connecting to Redis:", error);
      throw error;
    }
  }

  async function shutdownApp() {
    await client.quit();
    console.log('Redis connection closed');
    // Add any other shutdown logic here
  }

function setupCronJobs() {
    cron.schedule("*/5 * * * *", async () => {
        console.log("Running scheduled database query at", new Date().toLocaleString());
        try {
            const result = await prisma.$queryRaw`SELECT 1;`;
            console.log("Scheduled query result:", result);
        } catch (error) {
            console.error("Error executing scheduled query:", error);
        }
    });
}

async function startServer() {
    try {
        await initializeDatabase();
        initializeRedis();
        await initializeApp();

        //const worker = new Worker();
        //worker.startWorker();

        setupCronJobs();

        const port = app.get('PORT');
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

startServer();

process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await shutdownApp();
    process.exit(0);
  });

export default server;