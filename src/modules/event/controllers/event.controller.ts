import { Request, Response } from 'express';
import { EventService } from '../services/event.service';

export class EventController {
    private eventService: EventService;

    constructor() {
        this.eventService = new EventService();
    }

    public async getUserEvents(req: Request, res: Response) {
        try {
            const userId = req.query.userId;
            const userEvents = await this.eventService.getUserEvents(Number(userId));
            res.status(200).json(userEvents);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    public async getUserEventById(req: Request, res: Response) {
        try {
            const userId = req.body.user.id;
            const eventId = Number(req.body.eventId);
            const userEvent = await this.eventService.getUserEventById(userId, eventId);
            res.status(200).json(userEvent);
        } catch (error: any) {
            res.status(403).json({ error: error.message });
        }
    }

    public async submitEvent(req: Request, res: Response) {
        try {
            // To be Implemented
        } catch (error: any) {
            res.status(403).json({ error: error.message });
        }
    }
}