const cron = require('node-cron');
const axios = require('axios');

// Define the URL for your API endpoints
const BASE_URL = 'http://localhost:3000/api/r/result';

// Function to get test IDs and calculate scores
async function calculateResults() {
    try {
        // Get test IDs
        const eventId = 5; 
        const response = await axios.get(`${BASE_URL}/test-ids/${eventId}`);
        const testIds = response.data;

        // Calculate scores for each test ID
        for (const testId of testIds) {
            await axios.post(`${BASE_URL}/calculate`, { testId });
        }

        console.log('Results calculated successfully.');
    } catch (error) {
        console.error('Error in calculating results:', error);
    }
}

// Schedule the job to run at midnight
cron.schedule('0 0 * * *', calculateResults);

console.log('Cron job scheduled to run at midnight.');
