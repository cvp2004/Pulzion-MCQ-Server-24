import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface QuestionType {
  id: number;
  statement: string; // Mapped from `statement` in schema
  options: string[]; // Mapped from `options` in schema
  code: string | null;
  imageUrl: string | null;
  correctOption: number;
    emsEventId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class QuestionRepository {
  // Method to get a question by its ID
  async getQuestion(questionId: number): Promise<QuestionType | null> {
      const myQuestion = await prisma.question.findUnique({
      where: { id: questionId },
    });

      if (!myQuestion) {
      return null;
    }

    // Map the Prisma result to the QuestionType interface
    const mappedQuestion: QuestionType = {
        id: myQuestion.id,
        statement: myQuestion.statement, // Direct mapping
        options: myQuestion.options, // Direct mapping
        code: myQuestion.code,
        imageUrl: myQuestion.imageUrl,
        correctOption: myQuestion.correctOption,
        emsEventId: myQuestion.emsEventId, // Mapped from `eventId`
        createdAt: myQuestion.createdAt,
        updatedAt: myQuestion.updatedAt,
    };

    return mappedQuestion;
  }

  // Method to update the answer in the `user_Test` table
    async updateAnswer(testId: number, questionId: number, answer: any): Promise<any> {
    const updateAnswer = await prisma.testQuestion.updateMany({
      where: {
        testId: testId,
        questionId: questionId,
      },
      data: {
          // Our Options are stored in an Array  with 0-based index
          // Hence we have  added 1 to the selectedOption as correct option is stored on 1-based index
          selectedOption: answer.selectedOption + 1,
          reviewStatus: answer.reviewStatus,
          submitStatus: answer.submitStatus,
        updatedAt: new Date(),
      },
    });
        return updateAnswer.count;
  }

}
