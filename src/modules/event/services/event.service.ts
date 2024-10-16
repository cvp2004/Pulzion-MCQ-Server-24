import { EventRepository } from "../repositories/event.repository";

export class EventService {
    private eventRepository: EventRepository;

    constructor() {
        this.eventRepository = new EventRepository();
    }

    /**
     * Fetches all user events for a specific user and updates their started/finished status based on current time.
     * @param userId - The ID of the user (integer).
     * @returns An array of user events with updated statuses.
     */
    public async getUserEvents(userId: number) {
        const userEvents = await this.eventRepository.getUserEvents(userId);
        const now = new Date();
        
        for (const userEvent of userEvents) {
            const event = userEvent.event;
            
            // Update 'started' status
            if (event.startTime <= now && now <= event.endTime) {
                if (!userEvent.started) { // Only update if not already started
                    await this.eventRepository.updateUserEvent(userEvent.id, {
                        started: true,
                    });
                    userEvent.started = true; // Update local object
                }
            }
            
            // Update 'finished' status
            if (event.endTime < now) {
                if (!userEvent.finished) { // Only update if not already finished
                    await this.eventRepository.updateUserEvent(userEvent.id, {
                        finished: true,
                    });
                    userEvent.finished = true; // Update local object
                }
            }
            const eventName = await this.eventRepository.getEventName(event.emsEventId);
            const eventStartTime = new Date(event.startTime);
            const eventEndTime = new Date(event.endTime);
            const duration = eventEndTime.getTime() - eventStartTime.getTime()
            const durationInMinutes = duration / (1000 * 60); 
            (userEvent as any).name = eventName;
            (userEvent as any).durationInMinutes = durationInMinutes;
        }

        return userEvents;
    }

    /**
     * Retrieves a specific user event by user ID and event ID.
     * Throws an error if the event is finished or not found.
     * @param userId - The ID of the user (integer).
     * @param eventId - The ID of the event (integer).
     * @returns The user event if valid.
     */
    public async getUserEventById(userId: number, eventId: number) {
        const userEvent = await this.eventRepository.getUserEventById(userId, eventId);

        if (!userEvent) {
            throw new Error('User event not found.');
        }

        const now = new Date();

        if (userEvent.event.endTime < now) {
            throw new Error('Event has already finished.');
        }

        return userEvent;
    }

    /**
     * Updates the 'started' and 'finished' status of a user event.
     * @param eventId - The ID of the user event to update (integer).
     * @param data - An object containing the 'started' and 'finished' boolean flags.
     * @returns The updated user event.
     */
    public async updateUserEvent(eventId: number, data: { started: boolean; finished: boolean }) {
        return await this.eventRepository.updateUserEvent(eventId, data);
    }
}
