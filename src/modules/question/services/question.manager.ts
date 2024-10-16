import { QuestionType } from "../../../database/interfaces/question.interface";
import { UserResponse } from "../../../database/interfaces/response.interface";
import { client } from "../../../database/redis/Redis";


export class QuestionManager {
    public queueKey = 'answer_queue';
    private currentTimeKey = 'currentTime';

    async getTestTime(testId: number) {
        const currentTimeKey = `test:${testId}:currentTime`;
        const remainingTimeKey = `test:${testId}:remainingTime`;
    
        try {
            // Fetch current time and remaining time from Redis
            const [currentTime, remainingTime] = await Promise.all([
                client.get(currentTimeKey),
                client.get(remainingTimeKey)
            ]);
    
            return {
                currentTime: currentTime ? parseInt(currentTime) : null,
                remainingTime: remainingTime ? parseInt(remainingTime) : null
            };
        } catch (error) {
            console.error('Error getting test time:', error);
            return { currentTime: null, remainingTime: null };
        }
    }
    
    
    async updateRemainingTime(testId: number, newRemainingTime: number) {
        const remainingTimeKey = `test:${testId}:remainingTime`;
        const currentTimeKey = `test:${testId}:currentTime`;
    
        try {
            const currentTime = Math.floor(Date.now() / 1000);
            
            // Set new remaining time and current time in Redis
            await Promise.all([
                client.set(remainingTimeKey, newRemainingTime.toString()),
                client.set(currentTimeKey, currentTime.toString())
            ]);
    
            console.log(`Updated remaining time for test ${testId}`);
        } catch (error) {
            console.error('Error updating remaining time:', error);
            throw error;
        }
    }
    
    

    public async calculateRemainingTime(testId: number): Promise<number> {
        const remainingTimeKey = `test:${testId}:remainingTime`;
        const currentTimeKey = `test:${testId}:currentTime`;
    
        try {
            // Retrieve remaining time and start time from Redis
            const [remainingTime, startTime] = await Promise.all([
                client.get(remainingTimeKey),
                client.get(currentTimeKey)
            ]);
    
            if (!remainingTime || !startTime) {
                throw new Error(`Missing cache data for test ${testId}`);
            }
    
            // Calculate elapsed time
            const elapsedTime = Math.floor(Date.now() / 1000) - parseInt(startTime);
            const newRemainingTime = Math.max(0, parseInt(remainingTime) - elapsedTime);
    
            return newRemainingTime;
        } catch (error) {
            console.error(`Error calculating remaining time for test ${testId}:`, error);
            throw error;
        }
    }
    
    

    public async cacheAnswer(testId: number, questionId: number, answer: UserResponse) {
        const key = `test:${testId}:question:${questionId}`;
        const value = JSON.stringify(answer);

        try {
            await client.set(key, value);
            console.log(`Cached answer for test ${testId}, question ${questionId}`);
            // Update the currentTime after caching the answer
            await this.updateCurrentTime();
        } catch (error: any) {
            console.error('Error caching answer:', error);
        }
    }

    private async updateCurrentTime() {
        const currentTime = Date.now();
        try {
            await client.set(this.currentTimeKey, currentTime.toString());
            console.log(`Updated currentTime to ${new Date(currentTime).toISOString()}`);
        } catch (error: any) {
            console.error('Error updating currentTime:', error);
        }
    }

    async getCurrentTime(): Promise<number | null> {
        try {
            const time = await client.get(this.currentTimeKey);
            return time ? parseInt(time, 10) : null;
        } catch (error: any) {
            console.error('Error getting currentTime:', error);
            return null;
        }
    }

    async getAnswer(testId: number, questionId:number) {
        const key = `test:${testId}:question:${questionId}`;
        try{
            const cacheAnswer = await client.get(key);
            return cacheAnswer ? JSON.parse(cacheAnswer) : null;
        }catch(error:any){
            console.error('Error retrieving cached answer:', error);
            return null;
        }
    }

    async updateAnswer(testId: number, questionId: number, updateAnswer: UserResponse) {
        const key = `test:${testId}:question:${questionId}`;
        const value = JSON.stringify(updateAnswer);

        try {
            await client.set(key, value);
            console.log(`Updated cached answer for test ${testId}, question ${questionId}`);
        } catch (error) {
            console.error('Error updating cached answer:', error);
        }
    }

    async clearTestCache(testId: number) {
        const pattern = `test:${testId}:*`;
        
        try {
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
                console.log(`Cleared cache for test ${testId}`);
            }
        } catch (error) {
            console.error('Error clearing test cache:', error);
        }
    }

    async cacheTestQuestions(testId:number, questions:QuestionType[]) {
        try {
            for (const question of questions) {
                const key = `test:${testId}:question:${question.id}`;
                const value = JSON.stringify(question);
                await client.set(key, value);
            }

            const questionIdsKey = `test:${testId}:questionIds`;
            const questionIds = questions.map(q => q.id);
            await client.set(questionIdsKey, JSON.stringify(questionIds));

            console.log(`Cached questions for test ${testId}`);
        } catch (error) {
            console.error('Error caching questions:', error);
        }
    }

    async getQuestion(testId:number, questionId:number) {
        const key = `test:${testId}:question:${questionId}`;
        
        try {
            const cachedQuestion = await client.get(key);
            return cachedQuestion ? JSON.parse(cachedQuestion) : null;
        } catch (error) {
            console.error('Error retrieving cached question:', error);
            return null;
        }
    }

    async getTestQuestions(testId:number) {
        const key = `test:${testId}:questions`;
        
        try {
            const cachedQuestions = await client.get(key);
            return cachedQuestions ? JSON.parse(cachedQuestions) : null;
        } catch (error) {
            console.error('Error retrieving cached question IDs:', error);
            return null;
        }
    }

    async cacheQuestion(testId:number, question: QuestionType) {
        const key = `test:${testId}:question:${question.id}`;
        const value = JSON.stringify(question);
        
        try {
            await client.set(key, value);
            console.log(`Cached question ${question.id}`);
        } catch (error) {
            console.error(`Error caching question ${question.id}:`, error);
        }
    }

    async convertUnixTimestamp(timestamp: string): Promise<string> {
        const date = new Date(parseInt(timestamp) * 1000);
        return date.toUTCString();
    }
}