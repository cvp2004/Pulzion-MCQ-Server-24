//import { QuestionType } from "../../../database/interfaces/question.interface";
import { QuestionService } from "../services/question.service";
import { Request,Response } from "express";
//import { Worker } from "../worker/question.worker";

export class QuestionController {
    private questionService:QuestionService;
    //private worker:Worker;

    constructor(){
        this.questionService=new QuestionService();
        //this.worker=new Worker();
    }
    async getQuestion(req:Request,res:Response):Promise<any>{
        try {
            const question = await this.questionService.getQuestionById(req.body.testId, Number(req.params.id));
            return res.status(201).json({question});
        } catch (error) {
            console.error("error in get question ");
            if(error instanceof Error){
                return res.status(500).json({ message: error.message });
            }
            else{
                return res.status(500).json({ message: 'An unknown error occurred.' });
            }
        }
    }

    async updateAnswer(req:Request,res:Response):Promise<any>{
        const testId= req.body.test_id;
        const fkQuestionId = Number(req.params.id);
        const answer = req.body.answer;
        try {
            const updateAnswer = await this.questionService.updateAnswerById(testId, fkQuestionId, answer);
            //worker running
            // this.worker.startWorker();
            return res.status(201).json({"msg": "Record updated"});
        } catch (error) {
            console.error("error in updating answer");
            if(error instanceof Error){
                return res.status(500).json({ message: error.message });
            }
            else{
                return res.status(500).json({ message: 'An unknown error occurred.' });
            }
        }
    }

    async getCurrentTime(req: Request, res: Response) {
        try {
            const currentTime = await this.questionService.getCurrentTime();

            if (currentTime === null) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Current time not found in cache'
                });
            }

            return res.status(200).json({
                status: 'success',
                data: {
                    currentTime: currentTime,
                    formattedTime: new Date(currentTime).toISOString()
                }
            });
        } catch (error: any) {
            console.error('Error in getCurrentTime controller:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }

}