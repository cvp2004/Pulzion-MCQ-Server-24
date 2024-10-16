import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ResultRepository {
 
  public async getAllTestQuestions(testId: number) {
    return await prisma.testQuestion.findMany({
      where: { testId },
      include: { question: true }
    });
  }

  public async upsertTestResult(testId: number, eventId: number, score: number) {
    return await prisma.test_Result.upsert({
      where: { testId },
      create: {
        eventId,
        testId,
        score,
      },
      update: {
        score,
        updatedAt: new Date(),
      },
    });
  }

  public async findExistingTestId(testId: number) {
    return await prisma.test_Result.findUnique({
        where: { testId },
    })
  }

  public async getEventId(testId: number, testQuestionId: number) {
    return await prisma.testQuestion.findFirst({
      where: {
        testId: testId,
        id: testQuestionId,
      },
      select: {
        eventId: true,
      },
    });
  }

    //   public async getAllTestIdsOfaSlot(eventId: number) {
    //     return await prisma.user_Event.findMany({
    //         where: {eventId: eventId }
    //     })
    //   }
  
}