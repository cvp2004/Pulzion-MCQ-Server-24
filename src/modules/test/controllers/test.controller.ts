import { Request, Response } from 'express';
import { TestService } from '../services/test.service';

export class TestController {
  private testService: TestService;

  constructor() {
      this.testService = new TestService();
  }

    createUserTest = async (req: Request, res: Response) => {
        try {
            // Extract necessary data from the request
            const userId = parseInt(req.params.userId);
            const eventId = parseInt(req.params.eventId);

            if (isNaN(userId) || isNaN(eventId)) {
                res.status(400).json({ message: 'Invalid userId or eventId' });
                return;
            }

            const result = await this.testService.setTestStarted(userId, eventId);

            if (!result)
                throw new Error("Unable to set USerEvent Started ");

            const questionIds = await this.testService.getUserQuestions(userId, eventId);
            res.status(200).json({ "questionIds": questionIds });
            return;
        } catch (error) {
            console.error('Error creating user test:', error);
            res.status(500).json({ message: 'Error creating user test' });
        }
    }

    submitTest = async (req: Request, res: Response) => {
        try {
          const testId = parseInt(req.params.testId);
    
          if (isNaN(testId)) {
              res.status(400).json({ message: 'Invalid testId' });
              return;
          }
    
          await this.testService.processTestSubmission(testId);
          res.status(200).json({ message: 'Test submitted successfully' });
            return;
        } catch (error) {
          console.error('Error submitting test:', error);
          res.status(500).json({ message: 'Error submitting test' });
            return;
        }
      }
}