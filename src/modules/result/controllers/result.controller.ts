import { Request, Response } from 'express';
import { ResultService } from '../services/result.service';

export class ResultController {
  private resultService: ResultService;

  constructor() {
    this.resultService = new ResultService();
  }

  calculateScore = async (req: Request, res: Response) => {
    try {
      // Extract testId from the request body
      const testId = parseInt(req.body.testId);

      // Validate testId
      if (!testId || isNaN(testId)) {
        return res.status(400).json({ message: 'Invalid testId' });
      }

      // Call the service to calculate the score
      const calculatedScore = await this.resultService.calculateResultForTestId(testId);

      // Respond with the calculated score
      return res.status(200).json({ testId, calculatedScore });
    } catch (error) {
      console.error('Error calculating score:', error);
      return res.status(500).json({ message: 'Error calculating score' });
    }
  }


    //   getTestIdsBySlot = async (req: Request, res: Response) => {
    //     try {
    //       // Extract eventId from the request params or body
    //       const { eventId } = req.params;

    //       // Validate eventId
    //       if (!eventId || isNaN(Number(eventId))) {
    //         return res.status(400).json({ message: 'Invalid or missing eventId' });
    //       }

    //       // Call the service to get all test IDs associated with the eventId
    //       const testIds = await this.resultService.getTestIdsBySlot(Number(eventId));

    //       // Check if test IDs were found
    //       if (!testIds || testIds.length === 0) {
    //         return res.status(404).json({ message: 'No test IDs found for the given eventId' });
    //       }

    //       // Respond with the retrieved test IDs
    //       return res.status(200).json({ eventId: Number(eventId), testIds });
    //     } catch (error) {
    //       console.error(`Error fetching test IDs for eventId ${req.params.eventId}:`, error);
    //       return res.status(500).json({ message: 'An internal server error occurred while retrieving test IDs' });
    //     }
    //   }
}
