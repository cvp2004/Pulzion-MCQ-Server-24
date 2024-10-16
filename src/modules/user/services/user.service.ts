import { UsersType } from "../../../database/interfaces/user.interface";
import { UserRepository } from "../repositories/user.repository";
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import axios from 'axios';

const dummyUser = {
    id: 1,
    email: "new@yahoo.com",
    firstName: "John",
    lastName: "Doe",
    password: "password123", // Normally, you'd hash passwords in production
};

export class UserService {


    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    public async login(req: Request, res: Response): Promise<void> {

        if (!req.body || !req.body.email || !req.body.password) {
            res.status(400).json({ error: 'Invalid data' });
        }

        const email = req.body.email;
        const password = req.body.password;

        const apiUrl = `${process.env.EMS_API}/user/signin`;

        try {
            const apiResponse = await axios.post(apiUrl, { email, password }, { validateStatus: () => true });

            if (apiResponse.status !== 200 && apiResponse.status !== 201) {
                res.status(apiResponse.status).json(apiResponse.data);
                return;
            }

            console.log(apiResponse.data.user);


            let user = await this.userRepository.getUser(email);

            if (!user) {
                user = await this.userRepository.create(
                    email,
                    password,
                    apiResponse.data.user.firstName || 'John',
                    apiResponse.data.user.lastName || 'Doe'
                );
            } else {
                user = await this.userRepository.update(
                    user.id,
                    apiResponse.data.user.firstName,
                    apiResponse.data.user.lastName
                );
            }

            const token = apiResponse.data.token;
            const eventsResponse = await axios.get(`${process.env.EMS_API}/user_events`, {
                headers: { Authorization: `Bearer ${token}` },
                validateStatus: () => true
            });

            if (eventsResponse.status !== 200) {
                res.status(eventsResponse.status).json(eventsResponse.data);
                return;
            }

            const events = eventsResponse.data.events;

            for (const event of events) {
                if (event.platform === "mcq" || event.platform === "MCQ") {
                    const slotId = Number(event.fk_slot);
                    if (!slotId) continue;

                    const emsEvent = await this.userRepository.getEmsEvent(event.id);
                    if (!emsEvent) continue;

                    const slotDetails = await this.getSlotDetails(event.id, slotId);
                    if (!slotDetails) continue;

                    const eventRecord = await this.userRepository.upsertEvent(
                        emsEvent.emsEventId,
                        String(event.fk_slot),
                        slotDetails.startTime,
                        slotDetails.endTime
                    );

                    const test = await this.userRepository.getTest(eventRecord.id, user.id)
                        || await this.userRepository.createTest(
                            eventRecord.id,
                            user.id,
                            eventRecord.startTime,
                            eventRecord.endTime
                        );

                    const result = await this.userRepository.getResult(test.id)
                        || await this.userRepository.createResult(
                            test.id,
                            eventRecord.id,
                            0
                        );

                    await this.userRepository.getUserEvent(user.id, eventRecord.id)
                        || await this.userRepository.createUserEvent(
                            user.id,
                            eventRecord.id,
                            test.id,
                            result.id
                        );
                }
            }

            const jwtToken = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET || 'defaultSecret',
                { expiresIn: '1h' }
            );
            const refreshToken = jwt.sign(
                { id: user.id },
                process.env.JWT_REFRESH_SECRET || 'defaultRefreshSecret',
                { expiresIn: '7d' }
            );

            res.status(200).json({ user, access: jwtToken, refresh: refreshToken });

        } catch (error) {
            console.error('Error during sign-in:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
    }

    private async getSlotDetails(eventId: number, slotId: number) {
        try {
            const slotsUrl = `${process.env.EMS_API}/slots?event_id=` + eventId;

            const slotResponse = await axios.get(slotsUrl);

            if (slotResponse.status != 200)
                throw new Error("Erorr Fetching Slot DEtails from EMS Backend !!");

            const slots = slotResponse.data.slots;

            for (const slot of slots) {
                if (slot.id === slotId) {
                    return {
                        startTime: slot.start_time,
                        endTime: slot.end_time
                    };
                }
            }
        } catch (error) {
            throw new Error("Error while fetching Slot Details from EMS");
        }
    }
}
