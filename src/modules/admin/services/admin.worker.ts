import { PrismaClient } from '@prisma/client';
import workerpool from 'workerpool';
import { AdminRepository } from "../repositories/admin.repository";

const adminRepository = new AdminRepository();
async function calculateResultForTestId(testId: number): Promise<any> {
    try {
        let score = 0;
        let totalQuestionsConsidered = 0;

        const testQuestions = await adminRepository.getAllTestQuestions(testId);

        if (testQuestions.length != 0) {

            for (const testQuestion of testQuestions) {
                if (testQuestion.submitStatus && !testQuestion.reviewStatus) {
                    console.log("zxcvb");
                    totalQuestionsConsidered++;
                    if (testQuestion.selectedOption === testQuestion.question.correctOption) {

                        score++;
                    }
                }
            }

            await adminRepository.upsertTestResult(testId, testQuestions[0].eventId, score);
        }

        return { score, totalQuestionsConsidered };
    } catch (error) {
        console.error('Error calculating result in worker:', error);
        throw new Error('Error in worker calculation');
    }
}

// Register the worker function
workerpool.worker({
    calculateResultForTestId,
});
