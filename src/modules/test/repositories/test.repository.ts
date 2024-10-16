import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TestRepository {

    public async setStartedAt(testId: number) {
        const _test = await prisma.test.update({
            where: {
                id: testId
            },
            data: {
                startedAt: new Date()
            }
        });

        return _test;
    }

    public async setSubmittedAt(testId: number) {
        const _test = await prisma.test.update({
            where: {
                id: testId
            },
            data: {
                submittedAt: new Date()
            }
        });

        return _test;
    }

    // Randomly select a specified number of questions
    public randomQuestionSelection(questions: any[], numQuestions: number): any[] {
        const reservoir: any[] = [];

        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];

            if (i < numQuestions) {
                reservoir.push(question);
            } else {
                const randomIndex = Math.floor(Math.random() * (i + 1));
                if (randomIndex < numQuestions) {
                    reservoir[randomIndex] = question;
                }
            }
        }

        return reservoir;
    }

    public async setUserEventStarted(testId: number) {
        const user_Event = await prisma.user_Event.update({
            where: {
                testId: testId
            },
            data: {
                started: true
            }
        });

        return user_Event;
    }

    public async setUserEventFinished(testId: number) {
        const user_Event = await prisma.user_Event.update({
            where: {
                testId: testId
            },
            data: {
                finished: true
            }
        });

        return user_Event;
    }

    public async getEmsEventId(id: number) {
        const event = await prisma.event.findUnique({
            where: { id: id },
            select: { emsEventId: true }
        });

        if (!event) {
            throw new Error(`Event with id ${id} not found`);
        }

        return event.emsEventId;
    };
    // Method to get random questions from a specific event
    // public async getQuestions(eventId: number): Promise<any[]> {

    //     //logic to get emsEventId from Id
    //     const emsEventId = await this.getEmsEventId(eventId);
    //     const totalQuestions = await prisma.question.findMany({
    //         where: {
    //             emsEventId: emsEventId,
    //         },
    //         select: {
    //             id: true,
    //             statement: true,
    //             options: true,
    //             code: true,
    //             imageUrl: true,
    //             correctOption: true,
    //             emsEventId: true,
    //             createdAt: true,
    //             updatedAt: true,
    //         }
    //     });

    //     // Check if there are enough questions to select from
    //     const numQuestionsToSelect = 30;
    //     if (totalQuestions.length <= numQuestionsToSelect) {
    //         return totalQuestions; // Return all questions if fewer than numQuestionsToSelect
    //     }

    //     // Select a random sample of questions
    //     const randomQuestions = this.randomQuestionSelection(totalQuestions, numQuestionsToSelect);
    //     console.log("randomQuestions, ", randomQuestions);
    //     return randomQuestions;
    // }

    public async insertIntoTestQuestions(eventId: number, testId: number, questionIds: number[]): Promise<void> {
        for (const questionId of questionIds) {
            await prisma.testQuestion.create({
                data: {
                    testId: testId,
                    questionId: questionId,
                    eventId: eventId
                }
            });
        }
    }

    public async getQuestions(eventId: number): Promise<any[]> {

        // Logic to get emsEventId from Id
        const emsEventId = await this.getEmsEventId(eventId);

        const totalQuestions = await prisma.question.findMany({
            where: {
                emsEventId: emsEventId,
            },
            select: {
                id: true,
                statement: true,
                options: true,
                code: true,
                imageUrl: true,
                correctOption: true,
                emsEventId: true,
                createdAt: true,
                updatedAt: true,
                testQuestions: {
                    select: {
                        id: true,
                        eventId: true,
                        testId: true,
                        questionId: true,
                        selectedOption: true,
                        reviewStatus: true,
                        submitStatus: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });

        // Check if there are enough questions to select from
        const numQuestionsToSelect = 15;
        if (totalQuestions.length <= numQuestionsToSelect) {
            return totalQuestions; // Return all questions if fewer than numQuestionsToSelect
        }

        // Select a random sample of questions
        const randomQuestions = this.randomQuestionSelection(totalQuestions, numQuestionsToSelect);
        console.log("randomQuestions, ", randomQuestions);
        return randomQuestions;
    }

    public async getTestId(userId: number, eventId: number): Promise<number> {
        try {
            // Query the User_Event table to find the record matching userId and eventId
            const userEvent = await prisma.user_Event.findFirst({
                where: {
                    userId: userId,
                    eventId: eventId,
                },
                select: {
                    testId: true,
                },
            });

            // If no record is found, or testId is null, throw an error
            if (!userEvent || userEvent.testId === null) {
                throw new Error('Test ID not found');
            }

            // Return the testId directly
            return userEvent.testId;
        } catch (error) {
            console.error('Error fetching testId:', error);
            throw error;
        }
    }

    public async getTestQuestions(testId: number): Promise<any[]> {
        const testQuestions = await prisma.testQuestion.findMany({
            where: {
                testId: testId,
            },
            select: {
                question: {
                    select: {
                        id: true,
                        statement: true,
                        options: true,
                        code: true,
                        imageUrl: true,
                        emsEventId: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                },
                id: true,
                eventId: true,
                testId: true,
                questionId: true,
                selectedOption: true,
                reviewStatus: true,
                submitStatus: true,
                createdAt: true,
                updatedAt: true,

            },
        });

        // Return the entire testQuestion with question details included
        return testQuestions;
    }


    public async submitTest(testId: number) {
        try {
            const updatedUserEvent = await prisma.user_Event.update({
                where: {
                    testId: testId
                },
                data: {
                    started: true,
                    finished: true
                }
            });

            return updatedUserEvent;
        } catch (error) {
            console.error('Error submitting test:', error);
            throw new Error('Failed to submit test');
        }
    }

    public async getTime(testId: number): Promise<{ startTime: Date; endTime: Date }> {
        try {
            const test = await prisma.test.findUnique({
                where: {
                    id: testId
                },
                select: {
                    event: {
                        select: {
                            startTime: true,
                            endTime: true
                        }
                    }
                }
            });

            if (!test) {
                throw new Error(`Test with ID ${testId} not found`);
            }

            return {
                startTime: test.event.startTime,
                endTime: test.event.endTime
            };
        } catch (error) {
            console.error(`Error fetching time for test ${testId}:`, error);
            throw error;
        }
    }
}