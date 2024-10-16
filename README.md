# MCQ Platform

This repository contains the code for our Multiple Choice Question (MCQ) platform, which integrates with an existing Event Management System (EMS) backend.

## System Overview

The MCQ platform allows administrators to create and manage MCQ tests associated with events, while users can take these tests for events they've registered for.

### Key Features

1. Admin-side MCQ management
2. User authentication via EMS
3. Dynamic test generation
4. Response caching and batch processing
5. Leaderboard generation

## Workflow

### Admin Side

1. **Event Fetching**: An API fetches all "mcq" tagged events from the EMS backend and stores them in the `EmsEvent` table of the MCQ platform.

2. **Question Upload**: Admins can upload a CSV file containing questions, associating it with a specific EMS event ID.

3. **Leaderboard Publication**: 
   - Admins can publish leaderboards based on the EMS event ID.
   - Leaderboards can be further customized based on specific slots within an event.

### User Side

1. **First-time Login**: 
   - User logs in through the EMS API.
   - The system initializes the user's database entries:
     - `test`
     - `user_events`
     - `events`
     - `test_results`
   - The system calls the EMS API to fetch user events and slot information, storing it in the `event` table.

2. **Event View**: Users can see all their registered events, with currently active ones highlighted.

3. **Taking a Test**:
   - User selects an active event.
   - The system fetches random questions from the database for that event.
   - User answers the questions and submits the test.

4. **Viewing Leaderboards**:
   - Users can view leaderboards for events they've participated in.
   - Leaderboards may be specific to certain slots or for the entire event.

## Caching Implementation

- When questions are fetched for a test, they are cached to improve performance.
- Individual user responses are also cached.
- Cached responses are entered into the database through batch processing to optimize database operations.

## Setup and Installation

There are two ways to set up and run the MCQ Platform: manually or using Docker.

### Manual Setup

1. Ensure Redis is running locally on your machine.
2. Install the project dependencies:
   ```
   npm install
   ```
3. Generate Prisma client:
   ```
   npx prisma generate
   ```
4. Start the application:
   ```
   npm start
   ```

### Docker Setup

To run the application using Docker, simply use:

```
docker compose up
```

This will set up and start all the necessary services defined in your Docker Compose file.

## API Documentation

```
http://localhost:3000/swagger
```
