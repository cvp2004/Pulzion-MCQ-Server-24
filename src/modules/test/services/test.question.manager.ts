import { QuestionType } from "../../../database/interfaces/question.interface";
import { client } from "../../../database/redis/Redis";

export class TestManager {
    

    async cacheTestQuestions(testId: number, questions: QuestionType[]) {
        const key = `test:${testId}:questions`;
        const value = JSON.stringify(questions);

        try {
            await client.set(key, value);
            console.log(`Cached questions for test ${testId}`);
        } catch (error) {
            console.error('Error caching questions:', error);
        }
    }

    async cacheTestTime(testId: number, remainingTime: number) {
        const currentTimeKey = `test:${testId}:currentTime`;
        const remainingTimeKey = `test:${testId}:remainingTime`;
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

        try {
            // Check if both keys already exist
            const [existingCurrentTime, existingRemainingTime] = await Promise.all([
                client.get(currentTimeKey),
                client.get(remainingTimeKey)
            ]);

            if (existingCurrentTime && existingRemainingTime) {
                console.log(`Cache already exists for test ${testId}. Skipping update.`);
                return;
            }

            // If either key doesn't exist, set both keys
            await Promise.all([
                client.set(currentTimeKey, currentTime.toString()),
                client.set(remainingTimeKey, remainingTime.toString())
            ]);

            console.log(`Cached current time and remaining time for test ${testId}`);
        } catch (error) {
            console.error('Error caching test time:', error);
        }
    }

    public async submitTest(testId: number) {
        try {
            // Set remaining time to zero in cache
            await client.set(`test:${testId}:remainingTime`, '0');

            // Logic to exit the user from the test
            // Additional logic can be added here, such as:
            // - Saving the test results
            // - Updating the test status
            // - Notifying the user

            return { success: true, message: 'Test submitted successfully' };
        } catch (error) {
            console.error('Error submitting test:', error);
            return { success: false, message: 'Failed to submit test' };
        }
    }

    public async getRemainingTime(testId: number): Promise<number | null> {
        const remainingTimeKey = `test:${testId}:remainingTime`;
        
        try {
            // Get the remaining time in seconds from Redis
            const remainingTimeInSeconds = await client.get(remainingTimeKey);
    
            if (remainingTimeInSeconds === null) {
                // If no time is found, return null or handle it as needed
                return null;
            }
            return Number(remainingTimeInSeconds);
        } catch (error) {
            console.error(`Error retrieving remaining time for test ${testId}:`, error);
            throw new Error('Could not retrieve remaining time');
        }
    }
}
