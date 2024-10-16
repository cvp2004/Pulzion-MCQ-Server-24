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
- 
## Worker Threads

The platform uses **Worker Threads** to handle computationally intensive tasks, such as:

- **Leaderboard generation**: Worker threads are employed to handle the sorting and aggregation required to generate leaderboards, ensuring that these operations do not block the main application flow.

Worker threads allow the platform to process large volumes of data concurrently, ensuring a scalable and efficient system, especially under high user load.

## Worker Pool Setup

Here are the following properties to be configured for the Worker Pool :- 

- **minWorkers**: `number` | `'max'`  
  The minimum number of workers that must be initialized and kept available. Setting this to `'max'` will create `maxWorkers` default workers (see below).

- **maxWorkers**: `number`  
  The default number of `maxWorkers` is the number of CPU's minus one. When the number of CPU's could not be determined (for example in older browsers), `maxWorkers` is set to 3.

- **maxQueueSize**: `number`  
  The maximum number of tasks allowed to be queued. Can be used to prevent running out of memory. If the maximum is exceeded, adding a new task will throw an error. The default value is `Infinity`.

- **workerType**: `'auto'` | `'web'` | `'process'` | `'thread'`  
  - In case of `'auto'` (default), workerpool will automatically pick a suitable type of worker: when in a browser environment, `'web'` will be used. When in a Node.js environment, `worker_threads` will be used if available (Node.js >= 11.7.0), else `child_process` will be used.  
  - In case of `'web'`, a Web Worker will be used. Only available in a browser environment.  
  - In case of `'process'`, `child_process` will be used. Only available in a Node.js environment.  
  - In case of `'thread'`, `worker_threads` will be used. If `worker_threads` are not available, an error is thrown. Only available in a Node.js environment.

- **workerTerminateTimeout**: `number`  
  The timeout in milliseconds to wait for a worker to clean up its resources on termination before stopping it forcefully. Default value is `1000`.

- **forkArgs**: `String[]`  
  For `process` worker type. An array passed as args to `child_process.fork`.

- **forkOpts**: `Object`  
  For `process` worker type. An object passed as options to `child_process.fork`. See Node.js documentation for available options.

- **workerOpts**: `Object`  
  For `web` worker type. An object passed to the constructor of the web worker. See `WorkerOptions` specification for available options.

- **workerThreadOpts**: `Object`  
  For `thread` worker type. An object passed to `worker_threads.options`. See Node.js documentation for available options.

- **onCreateWorker**: `Function`  
  A callback that is called whenever a worker is being created. It can be used to allocate resources for each worker. The callback receives an object with the following properties:
  - `forkArgs`: `String[]`: the `forkArgs` option of this pool.
  - `forkOpts`: `Object`: the `forkOpts` option of this pool.
  - `workerOpts`: `Object`: the `workerOpts` option of this pool.
  - `script`: `string`: the `script` option of this pool.
  
  Optionally, this callback can return an object containing one or more of the above properties, which will override the pool properties for the worker being created.

- **onTerminateWorker**: `Function`  
  A callback that is called whenever a worker is being terminated. It can be used to release resources that might have been allocated for this specific worker. The callback is passed an object as described for `onCreateWorker`, with properties set to the values for the worker being terminated.

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


## Future Scope (Features to be Added)

- Add Admin side option to verify event and slots fetched from EMS before adding in the MCQ DB.
- Integrate External API to generate images for text based options which can't be copied using Google Lens.
- Option to display Image as a option.
