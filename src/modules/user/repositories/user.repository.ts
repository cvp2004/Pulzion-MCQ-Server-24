import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserRepository {
    // Create a new user
    public async create(email: string, password: string, first_name: string, last_name: string) {
        return prisma.user.create({
            data: {
                email: email,
                password: password,
                firstName: first_name,
                lastName: last_name
            },
        });
    }

    public async update(id: number, firstName: string, lastName: string) {
        return prisma.user.update({
            where: {
                id: id
            },
            data: {
                firstName: firstName,
                lastName: lastName
            }
        });
    }

    public async getUser(email: string) {
        return prisma.user.findFirst({
            where: {
                email: email
            }
        });
    }

    // Find an event by slot ID
    public async findEventBySlotId(slotId: string) {
        return prisma.event.findUnique({
            where: { emsSlotId: slotId },
        });
    }

    public async upsertEvent(fkEmsEventid: number, fk_slot: string, start_time: Date, end_time: Date) {
        return prisma.event.upsert({
            where: {
                emsSlotId: fk_slot
            },
            create: {
                emsEventId: fkEmsEventid,
                emsSlotId: fk_slot,
                startTime: start_time,
                endTime: end_time
            },
            update: {
                emsEventId: fkEmsEventid,
                emsSlotId: fk_slot,
                startTime: start_time,
                endTime: end_time
            }
        });
    }

    public async getEmsEvent(id: number) {
        return prisma.emsEvent.findFirst({
            where: {
                emsEventId: id
            }
        });
    }

    public async getUserEvent(userId: number, eventId: number) {
        return await prisma.user_Event.findFirst({
            where: {
                userId: userId,
                eventId: eventId
            }
        }); // Return the upserted user event
    }

    public async updateUserEvent(userEventId: number, userId: number, eventId: number, testId: number, resultId: number) {
        return await prisma.user_Event.update({
            where: {
                id: userEventId
            },
            data: {
                userId: userId,
                eventId: eventId,
                testId: testId,
                resultId: resultId
            }
        });
    }

    public async createUserEvent(userId: number, eventId: number, testId: number, resultId: number) {
        return prisma.user_Event.create({
            data: {
                userId: userId,
                eventId: eventId,
                testId: testId,
                resultId: resultId
            },
        });
    }

    public async updateTest(testId: number, eventId: number, userId: number, startTime: Date, endTime: Date) {
        return prisma.test.update({
            where: {
                id: testId
            },
            data: {
                eventId: eventId,
                userId: userId,
                startTime: startTime,
                endTime: endTime
            }
        });
    }

    // Create Test Record
    public async createTest(eventId: number, userId: number, startTime: Date, endTime: Date) {
        try {
            return prisma.test.create({
                data: {
                    eventId,
                    userId,
                    startTime,
                    endTime
                },
            });
        } catch (error) {
            console.error("Error creating Test:", error);
            throw error;
        }
    }

    public async getTest(eventId: number, userId: number) {
        return await prisma.test.findFirst({
            where: {
                eventId: eventId,
                userId: userId
            }
        });
    }

    public async createResult(testId: number, eventId: number, score: number) {
        try {
            return prisma.test_Result.create({
                data: {
                    testId,
                    eventId,
                    score
                },
            });
        } catch (error) {
            console.error("Error creating User_Event:", error);
            throw error;
        }
    }

    public async getResult(testId: number) {
        return await prisma.test_Result.findFirst({
            where: {
                testId: testId
            }
        });
    }

}
