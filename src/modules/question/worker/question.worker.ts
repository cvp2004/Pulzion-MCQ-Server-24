// import { client } from "../../../database/redis/Redis";
// import { QuestionManager } from "../services/question.manager";
// import { QuestionRepository } from "../repositories/question.repository";
// import cron from "node-cron";

// //const client = createClient();

// export class Worker {
//     private questionManager: QuestionManager;
//     private questionRepository: QuestionRepository;

//     constructor() {
//         this.questionManager = new QuestionManager();
//         this.questionRepository = new QuestionRepository();
//     }

//     public async processSubmission(submission: string): Promise<void> {
//         const { testId, fkQuestionId, answer } = JSON.parse(submission);
//         console.log(`Processing submission for testId ${testId}...`);
//         console.log(`Answer: ${answer}`);

//         try {
//             const result = await this.questionRepository.updateAnswer(testId, fkQuestionId, answer);
//             console.log("Result: ", result);
//             await new Promise(resolve => setTimeout(resolve, 1000));
//             console.log(`Finished processing submission for testId ${testId}.`);
//         } catch (err: any) {
//             console.log("Error processing submission: ", err);
//         }
//     }

//     private async batchProcessSubmissions(): Promise<void> {
//         try {
//             const batchSize = 3; 
//             const submissions: string[] = [];
            
//             for (let i = 0; i < batchSize; i++) {
//                 // Use 'brpop' instead of 'brPop'
//                 const submission = await client.brPop(this.questionManager.queueKey, 0);
//                 if (submission) {
//                     // The submission is an array [queueName, element]
//                     submissions.push(submission.element);
//                 } else {
//                     break; // No more submissions in the queue
//                 }
//             }
            
//             for (const submission of submissions) {
//                 await this.processSubmission(submission);
//             }
    
//             console.log(`Processed ${submissions.length} submissions in this batch.`);
//         } catch (err: any) {
//             console.log("Error in batch processing: ", err);
//         }
//     }

//     public startWorker(): void {
//         // Run the batch process every 5 minutes 
//         cron.schedule('*/3 * * * *', async () => {
//             console.log('Running batch process...');
//             await this.batchProcessSubmissions();
//         });

//         console.log('Worker started. Batch processing will run every 3 minutes.');
//     }
// }