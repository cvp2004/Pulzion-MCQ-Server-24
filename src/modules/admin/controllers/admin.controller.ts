import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';

export class AdminController {
    private adminService: AdminService;

    constructor() {
        this.adminService = new AdminService();
    }

    async fetchEvents(req: Request, res: Response): Promise<any> {
        try {
            const response = await this.adminService.fetchEvents(req);

            res.status(200).json(response);
        } catch (error) {
            console.error("Error in AdminController addEvent:", error);

            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'An unknown error occurred.' });
            }
        }
    }

    async fetchSlots(req: Request, res: Response): Promise<any> {
        try {
            const response = await this.adminService.fetchSlots(req);

            res.status(200).json(response);
        } catch (error) {
            console.error("Error in AdminController fetchSlots:", error);

            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'An unknown error occurred.' });
            }
        }
    }

    async saveQuestions(req: Request, res: Response): Promise<any> {

        if (!req.file) {
            res.status(400).send('No file uploaded');
            return;
        }

        try {
            const response = await this.adminService.saveQuestions(req);

            res.status(200).json(response);
        } catch (error) {
            console.error("Error in AdminController saveQuestions:", error);

            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'An unknown error occurred.' });
            }
        }
    }

    async generateEventLeaderboard(req: Request, res: Response): Promise<any> {
        try {
            const response = await this.adminService.generateEventLeaderboard(req);

            res.status(200).json(response);
        } catch (error) {
            console.error("Error in AdminController generateLeaderboard:", error);

            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'An unknown error occurred.' });
            }
        }
    }

    async generateSlotsLeaderboard(req: Request, res: Response): Promise<any> {
        try {
            const response = await this.adminService.generateSlotsLeaderboard(req);

            res.status(200).json(response);
        } catch (error) {
            console.error("Error in AdminController generateSlotsLeaderboard:", error);

            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'An unknown error occurred.' });
            }
        }
    }

    async getEvents(req: Request, res: Response): Promise<any> {
        try {
            const response = await this.adminService.getEvents(req);

            res.status(200).json(response);
        } catch (error) {
            console.error("Error in AdminController getEvents:", error);

            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'An unknown error occurred.' });
            }
        }
    }

    async getSlots(req: Request, res: Response): Promise<any> {
        try {
            const response = await this.adminService.getSlots(req);

            res.status(200).json(response);
        } catch (error) {
            console.error("Error in AdminController getSlots:", error);

            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'An unknown error occurred.' });
            }
        }
    }

    async getQuestions(req: Request, res: Response): Promise<any> {
        try {
            const response = await this.adminService.getQuestions(req);

            res.status(200).json(response);
        } catch (error) {
            console.error("Error in AdminController getQuestions:", error);

            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'An unknown error occurred.' });
            }
        }
    }
}