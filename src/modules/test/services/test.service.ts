import { PrismaClient } from '@prisma/client';
import { TestRepository } from '../repositories/test.repository';
import { TestManager } from './test.question.manager';

export class TestService {
    private testRepository: TestRepository;
    private testManager: TestManager;
    private prisma: PrismaClient;

    constructor() {
        this.testRepository = new TestRepository();
        this.testManager = new TestManager();
        this.prisma = new PrismaClient();
    }

    public async setTestStarted(userId: number, eventId: number): Promise<any> {

        const testId = await this.testRepository.getTestId(userId, eventId);

        if (!testId)
            throw new Error("Error while Starting Test");

        const user_Event = await this.testRepository.setUserEventStarted(testId);
        await this.testRepository.setStartedAt(testId);

        if (!user_Event || user_Event.started != true)
            return false;

        return true;
    }

    public async setTestFinished(testId: number): Promise<any> {

        if (!testId)
            throw new Error("Error while Starting Test");

        const user_Event = await this.testRepository.setUserEventFinished(testId);
        await this.testRepository.setSubmittedAt(testId);

        if (!user_Event || user_Event.finished != true)
            return false;

        return true;
    }



    public async getUserQuestions(userId: number, eventId: number) {
        console.log(`Getting questions for user ${userId} and event ${eventId}`);

        const testId = await this.testRepository.getTestId(userId, eventId);
        console.log(`Retrieved testId: ${testId}`);

        let questions = await this.testRepository.getTestQuestions(testId);
        console.log(`Initial questions retrieved: ${questions.length}`);

        if (questions.length === 0) {
            console.log('No questions found for this test. Retrieving new questions.');
            questions = await this.testRepository.getQuestions(eventId);
            console.log(`Retrieved ${questions.length} questions for the event`);

            const questionIds = questions.map(q => q.id);
            console.log(`Question IDs: ${questionIds.join(', ')}`);

            await this.testRepository.insertIntoTestQuestions(eventId, testId, questionIds);
            console.log('Inserted questions into testQuestions table');

            questions = await this.testRepository.getTestQuestions(testId);
            console.log(`Retrieved ${questions.length} questions after insertion`);

            const testTime = await this.testRepository.getTime(testId);
            const remainingTime = (testTime.endTime.getTime() - testTime.startTime.getTime()) / 1000;
            console.log(`Calculated remaining time: ${remainingTime} seconds`);

            await this.testManager.cacheTestTime(testId, remainingTime);
            console.log('Cached test time');
        } else {



            console.log(`Found ${questions.length} existing questions for this test`);
        }

        const remainingTime = await this.testManager.getRemainingTime(testId);
        console.log(`Retrieved remaining time: ${remainingTime}`);

        if (remainingTime === null) {
            console.error("Failed to fetch remaining time");
            throw new Error("Failed to fetch remaining time");
        }

        const sanitizedQuestions = questions.map(({ correctOption, ...rest }) => rest);
        console.log(`Sanitized ${sanitizedQuestions.length} questions`);

        console.log('Returning questions and remaining time');
        sanitizedQuestions.sort((a, b) => a.question.id - b.question.id);
        return {
            questions: sanitizedQuestions,
            remainingTime
        };
    }



    public async processTestSubmission(testId: number): Promise<void> {
        try {
            // Perform any pre-submission logic here

            // Call the submitTest function
            await this.testManager.submitTest(testId);
            await this.testRepository.submitTest(testId);
            await this.setTestFinished(testId);
            // Perform any post-submission logic here
            console.log(`Test ${testId} submitted successfully`);
        } catch (error) {
            console.error('Error processing test submission:', error);
            throw new Error('Failed to process test submission');
        }
    }
}