//import { UsersType } from "../../../database/interfaces/user.interface";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export interface UsersType {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export class AdminRepository {

    async getQuestions(emsEventId: number): Promise<any> {
        return await prisma.question.findMany({
            where: {
                emsEventId: emsEventId,
            },
        });
    }

    async getEmsEvents(): Promise<any> {
        return await prisma.emsEvent.findMany();
    }

    async getSlots(emsEventId: number): Promise<any> {
        return await prisma.event.findMany({
            where: {
                emsEventId: emsEventId,
            },
        });
    }

    async setEmsEvents(events: any[]): Promise<any> {
        for (const event of events) {
            if (event.platform === "mcq" || event.platform === "MCQ") {
                await prisma.emsEvent.upsert({
                    where: { emsEventId: event.id },
                    create: {
                        name: event.name,
                        imageUrl: event.image_url,
                        emsEventId: event.id,
                        rules: event.rules,
                    },
                    update: {
                        name: event.name,
                        imageUrl: event.image_url,
                        rules: event.rules
                    },
                });
            }
        }

        return prisma.emsEvent.findMany();
    }

    async setEmsSlots(slots: any[]): Promise<any> {
        for (const slot of slots) {
            await prisma.event.upsert({
                where: { emsSlotId: String(slot.id) },
                create: {
                    emsEventId: slot.fk_event,
                    emsSlotId: String(slot.id),
                    startTime: new Date(slot.start_time),
                    endTime: new Date(slot.end_time),
                },
                update: {
                    emsEventId: slot.fk_event,
                    emsSlotId: String(slot.id),
                    startTime: new Date(slot.start_time),
                    endTime: new Date(slot.end_time),
                },
            });
        }

        return prisma.emsEvent.findMany();
    }

    async findEventBySlotId(slotId: string) {
        return prisma.event.findFirst({
            where: { emsSlotId: slotId },
        });
    }

    async insertQuestion(
        statement: string,
        options: string[],
        code: string | null,
        imageUrl: string | null,
        correctOption: number,
        emsEventId: number
    ) {
        return await prisma.question.create({
            data: {
                statement: statement,
                options: options,
                code: code,
                imageUrl: imageUrl,
                correctOption: correctOption,
                emsEventId: emsEventId, // Foreign key reference to Event
            },
        });
    }

    async getEvents(emsEventId: number) {
        return await prisma.event.findMany({
            where: {
                emsEvent: {
                    emsEventId: emsEventId
                },
            },
        });
    }

    async getTestResults(slotIds: number[]) {
        return await prisma.test_Result.findMany({
            where: {
                eventId: {
                    in: slotIds,
                },
            },
            orderBy: {
                score: "desc",
            },
        });
    }

    public async getAllTestQuestions(testId: number) {
        return await prisma.testQuestion.findMany({
            where: { testId },
            include: { question: true },
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

    public async findExistingTestResult(testId: number) {
        return await prisma.test_Result.findUnique({
            where: { testId },
        });
    }

    public async getTestsForSlotIds(slotIds: number[]) {
        return await prisma.test.findMany({
            where: {
                eventId: {
                    in: slotIds,
                },
            },
        });
    }

    public async getTestsForEmsEventId(emsEventId: number) {
        return await prisma.test.findMany({
            where: {
                event: {
                    emsEvent: {
                        emsEventId: emsEventId
                    },
                },
            },
        });
    }

    public async getTestResultsForEmsEventId(emsEventId: number) {
        return await prisma.test_Result.findMany({
            where: {
                event: {
                    emsEvent: {
                        emsEventId: emsEventId
                    },
                },
            },
        });
    }
}
