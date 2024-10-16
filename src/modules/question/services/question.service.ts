import { QuestionType } from "../../../database/interfaces/question.interface";
import { UserResponse } from "../../../database/interfaces/response.interface";
import { client } from "../../../database/redis/Redis";
import { QuestionRepository } from "../repositories/question.repository";
import { QuestionManager } from "./question.manager";

export class QuestionService {
    private questionRepository: QuestionRepository;
    private questionManager: QuestionManager;
    
    constructor() {
        this.questionRepository = new QuestionRepository();
        this.questionManager = new QuestionManager();
    }

    public async getQuestionById(testId: number, questionId: number): Promise<QuestionType> {
        // Attempt to retrieve question from cache
        const cachedQuestion = await this.questionManager.getQuestion(testId, questionId);

        if (cachedQuestion) {
            console.log(`Question ${questionId} found in cache`);
            return cachedQuestion;
        }

        // If not found in cache, fetch from database
        console.log(`Question ${questionId} not in cache, fetching from database`);
        const question = await this.questionRepository.getQuestion(questionId);
        
        if (!question) {
            throw new Error("Question not found");
        }

        // Remove correct answer from the question object
        const { correctOption, ...questionWithoutCorrectOption } = question;

        // Cache the question for future use
        await this.questionManager.cacheQuestion(testId, questionWithoutCorrectOption);

        return questionWithoutCorrectOption;
    }
    
    public async updateAnswerById(testId: number, fkQuestionId: number, answer: UserResponse): Promise<any> {
        console.log(`Updating answer for testId: ${testId}, questionId: ${fkQuestionId}`);
        
        try {
            // Start with the database update
            const updateAnsInDB = await this.questionRepository.updateAnswer(testId, fkQuestionId, answer);
            console.log(`Answer updated in DB`);
    
            // Perform Redis operations
            try {
                const [newRemainingTime, cacheAnswer] = await Promise.all([
                    this.questionManager.calculateRemainingTime(testId),
                    this.questionManager.cacheAnswer(testId, fkQuestionId, answer)
                ]);
                console.log(`New remaining time: ${newRemainingTime}`);
                console.log(`Answer cached in Redis`);
    
                // Update remaining time in cache
                await this.questionManager.updateRemainingTime(testId, newRemainingTime);
                console.log(`Remaining time updated in Redis cache`);
    
                return cacheAnswer;
            } catch (redisError: any) {
                console.error(`Redis operation failed: ${redisError.message}`);
                // Redis operations failed, but DB update was successful
                // Return the answer from the database update instead
                return updateAnsInDB;
            }
        } catch (error: any) {
            console.error(`Error in updateAnswerById: ${error.message}`);
            throw new Error(`Failed to update answer: ${error.message}`);
        }
    }
    
    

    public async getCurrentTime(): Promise<number | null> {
        try {
            const currentTime = await this.questionManager.getCurrentTime();
            
            if (currentTime === null) {
                console.log('No current time found in cache.');
                return null;
            }

            console.log(`Retrieved current time: ${new Date(currentTime).toISOString()}`);
            return currentTime;
        } catch (error: any) {
            console.error('Error retrieving current time:', error.message);
            return null;
        }
    }
}