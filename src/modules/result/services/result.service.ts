import { PrismaClient } from '@prisma/client';
import { ResultRepository } from '../repositories/result.repository';

export class ResultService {
  private resultRepository: ResultRepository;
  private prisma: PrismaClient;

  constructor() {
    this.resultRepository = new ResultRepository();
    this.prisma = new PrismaClient();
  }

  /**
   * Calculate and save the test result for a given testId.
   * 
   * @param testId The ID of the test for which the result is being calculated.
   */
  public async calculateResultForTestId(testId: number) {
    try {
      let score = 0;
      let totalQuestionsConsidered = 0;

      // Retrieve all test questions for the given testId
      const testQuestions = await this.resultRepository.getAllTestQuestions(testId);

      // Iterate through each test question to calculate the score
      for (const testQuestion of testQuestions) {
        if (testQuestion.submitStatus === true && testQuestion.reviewStatus === false) {
          totalQuestionsConsidered++;
          // Increment score if the selected option matches the correct answer
          if (testQuestion.selectedOption === testQuestion.question.correctOption) {
            score++;
          }
        }
      }

      // Fetch existing test result if it exists
      const existingTestResult = await this.resultRepository.findExistingTestId(testId);

      // If a result exists, update it; otherwise, insert a new one
      if (existingTestResult) {
        await this.resultRepository.upsertTestResult(testId, testQuestions[0].eventId, score);
      } else {
        await this.resultRepository.upsertTestResult(testId, testQuestions[0].eventId, score);
      }

      return {
        score,
        totalQuestionsConsidered
      };

    } catch (error) {
      console.error(`Error calculating result for testId ${testId}:`, error);
      throw new Error('Could not calculate the result. Please try again later.');
    }
  }

    //   public async getTestIdsBySlot(eventId: number) {
    //     try {
    //       // Fetch all test IDs associated with the provided eventId
    //       const testIds = await this.resultRepository.getAllTestIdsOfaSlot(eventId);

    //       // Return the retrieved test IDs
    //       return testIds.map(i => i.testId);
    //     } catch (error) {
    //       console.error(`Error fetching test IDs for eventId ${eventId}:`, error);
    //       throw new Error('Could not retrieve test IDs for the given event. Please try again later.');
    //     }
    //   }

}
