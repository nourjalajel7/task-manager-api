# Task Manager REST API

A secure RESTful API for managing personal tasks, built with Node.js, Express.js, and MongoDB.

This project demonstrates backend development fundamentals, including user authentication, authorization, database operations, and secure task management.

## Technologies Used

- Node.js
- Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- Postman
- Git & GitHub

## Features

### User Authentication
- User registration and login
- Password hashing using bcryptjs
- JWT-based authentication
- Protected task endpoints

### Task Management
- Create a new task
- Retrieve all tasks belonging to the authenticated user
- Retrieve a specific task
- Update an existing task
- Delete a task
- Set task status, priority, description, and due date

### Security
- Each task belongs to a specific user
- Users can only access and manage their own tasks
- Cross-user access is restricted
- Task ownership cannot be modified through API requests
- Input validation and error handling

## API Endpoints

| Method | Endpoint             |Description |
|---     |---                   |---              |
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Login and receive a JWT |
| GET    | `/api/tasks`         | Get authenticated user's tasks |
| GET    | `/api/tasks/:id`     | Get a specific task |
| POST   | `/api/tasks`         | Create a task |
| PUT    | `/api/tasks/:id`     | Update a task |
| DELETE | `/api/tasks/:id`     | Delete a task |
| GET    | `/health`            | Check API health |

All `/api/tasks` endpoints require a valid JWT.

## Installation and Setup

1. Clone the repository:

   `git clone https://github.com/nourjalajel7/task-manager-api.git`

2. Navigate to the project:

   `cd task-manager-api`

3. Install dependencies:

   `npm install`

4. Create a `.env` file and configure:

   ```env
   PORT=5000
   MONGO_URI=
   JWT_SECRET=
   ```

5. Start the application:

   `npm start`
   For development:
   `npm run dev`

## Testing

API endpoints can be tested using Postman.

Authentication requires:

`Authorization: Bearer YOUR_JWT_TOKEN`

The project includes automated authorization tests:

`node --test tests/authorization.test.js`

These tests cover authentication, task ownership restrictions, and validation.

## Project Status

Core backend functionality implemented. Authentication, task creation, task listing, and cross-user access restrictions have been manually tested using Postman.

## Author

Nour Jalajel

Computer Science Graduate | Backend Development

GitHub: https://github.com/nourjalajel7
