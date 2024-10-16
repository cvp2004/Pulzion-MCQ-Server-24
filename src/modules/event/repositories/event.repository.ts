import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class EventRepository {
    // Fetch all user events for a specific user
    async getUserEvents(userId: number) {
        try {
            return await prisma.user_Event.findMany({
                where: { userId: userId },
                include: {
                    event: true, // Include related Event data
                },
            });
        } catch (error) {
            console.error('Error fetching user events:', error);
            throw new Error('Unable to fetch user events');
        }
    }

    // Update a user event
    async updateUserEvent(eventId: number, data: any) {
        try {
            return await prisma.user_Event.update({
                where: { id: eventId },
                data,
            });
        } catch (error) {
            console.error('Error updating user event:', error);
            throw new Error('Unable to update user event');
        }
    }

    async getEventName(emsEventId: number) {
        try {
          const event = await prisma.emsEvent.findUnique({
            where: {
              emsEventId: emsEventId
            },
            select: {
              name: true
            }
          })
      
          return event ? event.name : null
        } catch (error) {
          console.error('Error fetching event name:', error)
        }
    }

    // Find a specific user event by ID
    async getUserEventById(userId: number, eventId: number) {
        try {
            return await prisma.user_Event.findFirst({
                where: { userId: userId, eventId: eventId },
                include: { event: true },
            });
        } catch (error) {
            console.error('Error fetching user event by ID:', error);
            throw new Error('Unable to fetch user event by ID');
        }
    }
}
