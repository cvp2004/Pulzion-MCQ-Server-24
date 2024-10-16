import { AdminRepository } from "../repositories/admin.repository";
import { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import csv from 'csv-parser';
import axios from 'axios';
import workerpool, { Pool } from 'workerpool';

interface CSVRow {
    statement: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    code?: string | null;
    image_url?: string | null;
    correct_option: number;
    fk_event: number;
}

export class AdminService {
    private adminRepository: AdminRepository;
    private upload: multer.Multer;
    private pool: Pool;

    constructor() {
        this.adminRepository = new AdminRepository();
        // Setup download location for uploaded files
        this.upload = multer({ dest: 'uploads/' });
        // Initialize worker pool with a maximum of 4 threads
        this.pool = workerpool.pool(__dirname + '/admin.worker.js', {
            minWorkers: 5, // Minimum number of threads (can be 0 or more)
            maxWorkers: 15 // Maximum number of threads
        });
    }

    public getEvents = async (req: Request): Promise<any> => {
        const events = await this.adminRepository.getEmsEvents();
        return events;
    }

    public getSlots = async (req: Request): Promise<any> => {
        try {
            const emsEventId = parseInt(req.params.emsEventId);
            const slots = await this.adminRepository.getSlots(emsEventId);
            return slots;
        } catch (error) {
            console.error('Error Fetching EmsEvents from MCQ DB:', error);
            throw new Error('Error while EmsEvents from MCQ DB');
        }
    }

    public fetchSlots = async (req: Request): Promise<any> => {

        console.log("Hello 1");


        const emsEventId = parseInt(req.params.emsEventId);

        const EMS_API: string = process.env.EMS_API as string;
        const eventsUrl = EMS_API + `/slots?event_id=` + emsEventId;

        const response = await this.emsRequest(eventsUrl);

        console.log("Hello 2");

        console.log("response = " + response);

        const slots = response.slots;

        console.log("Hello 3");

        console.log("slots = " + slots);

        if (slots.length === 0)
            throw new Error('No slots found for the given EventId');

        const newSlots = this.adminRepository.setEmsSlots(slots);
        return newSlots;

    }

    public fetchEvents = async (req: Request): Promise<any> => {
        try {

            const EMS_API: string = process.env.EMS_API as string;
            const eventsUrl = `${process.env.EMS_API}/events`;

            let response = await this.emsRequest(eventsUrl);

            const events = response.events;

            if (events.length === 0)
                throw new Error('No Events Recieved Form EMS Server !!');

            console.log(events);

            const newEvents = this.adminRepository.setEmsEvents(events);
            return newEvents;
        } catch (error) {
            console.error('Error fetching events:', error);
            throw new Error('Error while fetching events');
        }
    };

    public emsRequest = async (eventsUrl: any): Promise<any> => {
        try {
            const eventsResponse = await axios.get(eventsUrl);
            return eventsResponse.data;
        } catch (error) {
            console.error('Error fetching Data from EMS:', error);
            throw new Error('Error while fetching Data from EMS');
        }
    };

    public getQuestions = async (req: Request): Promise<any> => {
        try {
            const emsEventId = parseInt(req.params.emsEventId);
            const questions = await this.adminRepository.getQuestions(emsEventId);
            return questions;
        } catch (error) {
            console.error('Error fetching questions:', error);
            throw new Error('Error while fetching questions');
        }
    };

    public saveQuestions = async (req: Request): Promise<any> => {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const filePath = req.file?.path;
        if (!filePath) {
            throw new Error('No file uploaded');
        }
        const questions: CSVRow[] = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row: CSVRow) => {
                questions.push(row);
            })
            .on('end', async () => {
                for (const row of questions) {
                    const img = row.image_url || null;
                    await this.adminRepository.insertQuestion(
                        row.statement,
                        [row.optionA, row.optionB, row.optionC, row.optionD],
                        row.code || null,
                        img,
                        Number(row.correct_option),
                        Number(req.body.emsEventId)
                    );
                }
                fs.unlinkSync(filePath);
                return 'CSV file successfully processed';
            })
            .on('error', (error: Error) => {
                console.log('Error reading CSV file:', error);
                throw new Error('Error while reading CSV file');
            });
    };

    public generateEventLeaderboard = async (req: Request): Promise<any> => {
        const emsEventId = parseInt(req.params.emsEventId);
        const slots = await this.adminRepository.getEvents(emsEventId);

        if (slots.length === 0) {
            throw new Error('No slots found for the given EventId');
        }

        const slotIds = slots.map((slot: any) => slot.id);
        await this.calculateResultForSlotIds(slotIds);

        const results = await this.adminRepository.getTestResults(slotIds);
        return results;
    };

    public generateSlotsLeaderboard = async (req: Request): Promise<any> => {
        const slotIds = req.body.slotIds;

        if (!slotIds || slotIds.length === 0) {
            throw new Error('No SlotIds provided');
        }

        await this.calculateResultForSlotIds(slotIds);

        const results = await this.adminRepository.getTestResults(slotIds);
        return results;
    };

    public async calculateResultForSlotIds(slotIds: any): Promise<void> {
        try {
            const tests = await this.adminRepository.getTestsForSlotIds(slotIds);
            for (const test of tests) {
                await this.calculateResultForTestId(test.id);
            }
        } catch (error) {
            console.error('Error calculating result for slot IDs:', error);
            throw new Error('Could not calculate the result. Please try again later.');
        }
    }

    public async calculateResultForTestId(testId: number): Promise<any> {
        try {
            // Use worker pool to calculate result in a separate thread
            const { score, totalQuestionsConsidered } = await this.pool.exec('calculateResultForTestId', [testId]);
            console.log("sfdsf");

            return { score, totalQuestionsConsidered };
        } catch (error) {
            console.error('Error calculating result using worker:', error);
            throw new Error('Could not calculate the result in worker thread.');
        }
    }

    // Clean up worker pool when done
    public async closeWorkerPool() {
        await this.pool.terminate();
    }
}
// Handle graceful shutdown for different signals
const shutdownHandler = async () => {
    const adminService = new AdminService();
    await adminService.closeWorkerPool();
    process.exit();
};
process.on('SIGINT', shutdownHandler);
process.on('SIGTERM', shutdownHandler);
process.on('SIGQUIT', shutdownHandler);
