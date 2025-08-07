# API Contract: Job Sethu

This document serves as the single source of truth for the Job Sethu application's API. It defines the data models and API endpoints that the frontend and backend teams will use to communicate.

## 1. Application Features

- **User Registration & Onboarding:** New users can create an account and set up their initial profile with skills and location.
- **User Login:** Registered users can log in to access the platform. Assumes JWT-based authentication.
- **Job Posting:** Authenticated users can create, view, and manage job postings.
- **Job Feed & Search:** Users can view a feed of all open jobs and search for specific jobs based on keywords or skills.
- **Job Application:** Authenticated users can apply for open jobs.
- **View & Manage Postings:** Job posters can view applicants for their jobs and assign a worker.
- **Chat System:** A real-time chat system for communication between a job poster and the assigned worker.
- **Profile Management:** Users can view and update their public profiles, including skills, about section, and avatar.

---

## 2. Data Models

### User Model

Represents a user of the platform.

```json
{
  "id": "user-1", // Unique identifier (string)
  "name": "Vedanth Bandodkar", // Full name of the user (string)
  "email": "vedanth@example.com", // User's email address (string, unique)
  "avatarUrl": "https://i.pravatar.cc/150?u=user-1", // URL to the user's profile picture (string)
  "skills": ["React", "Node.js", "Web Design"], // Array of user's skills (string[])
  "location": "Panjim, Goa", // User's location (string)
  "about": "Passionate web developer skilled in the MERN stack...", // A brief bio (string, optional)
  "createdAt": "2023-10-27T10:00:00Z" // ISO 8601 timestamp
}
```

### Job Model

Represents a job posting on the platform.

```json
{
  "id": "job-1", // Unique identifier (string)
  "title": "Simple Website for a Local Cafe", // Job title (string)
  "description": "Need a student to build a one-page responsive website...", // Detailed job description (string)
  "skills": ["HTML", "CSS", "Web Design"], // Required skills for the job (string[])
  "payment": 4000, // Payment amount in INR (number)
  "sos": false, // Flag for urgent jobs (boolean)
  "location": "Panjim, Goa", // Job location (string)
  "status": "open", // Current status: 'open', 'assigned', 'completed', 'paid', 'canceled' (string)
  "posterId": "user-1", // ID of the user who posted the job (string)
  "workerId": null, // ID of the assigned worker (string, nullable)
  "applicants": ["user-3"], // Array of user IDs who have applied (string[])
  "createdAt": "2023-10-27T10:00:00Z" // ISO 8601 timestamp
}
```

### Application Model (Implicit)

The concept of an "Application" is represented by a user's ID being present in the `applicants` array of a `Job` model. No separate model is needed.

### ChatMessage Model

Represents a single message in a chat conversation.

```json
{
  "id": "msg-1", // Unique identifier (string)
  "jobId": "job-2", // The job this chat is associated with (string)
  "senderId": "user-3", // ID of the user who sent the message (string)
  "content": "Hi! I'm interested in this job. When can we discuss?", // The message content (string)
  "timestamp": "2023-10-27T11:00:00Z" // ISO 8601 timestamp
}
```

---

## 3. API Endpoints

All endpoints are prefixed with `/api`. Authentication is required for all endpoints except `Login` and `Register`.

### Authentication

#### Feature: User Registration
- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Description:** Creates a new user account.
- **Request Body:**
  ```json
  {
    "name": "Namir Khan",
    "email": "namir@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "user": {
      "id": "user-5",
      "name": "Namir Khan",
      "email": "namir@example.com"
    },
    "token": "ey..."
  }
  ```
- **Error Response (400):**
  ```json
  {
    "message": "Email already exists."
  }
  ```

#### Feature: User Login
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Description:** Authenticates a user and returns a JWT.
- **Request Body:**
  ```json
  {
    "email": "namir@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "user": {
      "id": "user-5",
      "name": "Namir Khan",
      "email": "namir@example.com"
    },
    "token": "ey..."
  }
  ```
- **Error Response (401):**
  ```json
  {
    "message": "Invalid credentials."
  }
  ```

### Users

#### Feature: Get User Profile
- **Method:** `GET`
- **Endpoint:** `/api/users/:userId`
- **Description:** Retrieves the public profile of a specific user.
- **Request Body:** None
- **Success Response (200):**
  ```json
  {
    "id": "user-1",
    "name": "Vedanth Bandodkar",
    "avatarUrl": "https://i.pravatar.cc/150?u=user-1",
    "skills": ["React", "Node.js", "Web Design"],
    "location": "Panjim, Goa",
    "about": "Passionate web developer...",
    "createdAt": "2023-10-27T10:00:00Z"
  }
  ```
- **Error Response (404):**
  ```json
  {
    "message": "User not found."
  }
  ```

#### Feature: Update User Profile
- **Method:** `PUT`
- **Endpoint:** `/api/users/me`
- **Description:** Updates the profile of the currently authenticated user.
- **Request Body:**
  ```json
  {
    "name": "Vedanth B.",
    "location": "Bambolim, Goa",
    "skills": ["React", "Next.js", "Firebase"],
    "about": "An updated bio about my new skills."
  }
  ```
- **Success Response (200):**
  ```json
  {
    "id": "user-1",
    "name": "Vedanth B.",
    "email": "vedanth@example.com",
    "avatarUrl": "https://i.pravatar.cc/150?u=user-1",
    "skills": ["React", "Next.js", "Firebase"],
    "location": "Bambolim, Goa",
    "about": "An updated bio about my new skills.",
    "createdAt": "2023-10-27T10:00:00Z"
  }
  ```
- **Error Response (400):**
  ```json
  {
    "message": "Validation Error: Skills must be an array of strings."
  }
  ```

### Jobs

#### Feature: Get All Jobs
- **Method:** `GET`
- **Endpoint:** `/api/jobs`
- **Description:** Retrieves a list of all `open` jobs. Can be filtered by a search query.
- **Request Body:** None
- **Success Response (200):**
  ```json
  [
    {
      "id": "job-1",
      "title": "Simple Website for a Local Cafe",
      "skills": ["HTML", "CSS"],
      "payment": 4000,
      "location": "Panjim, Goa",
      "status": "open",
      "createdAt": "2023-10-27T10:00:00Z"
    }
  ]
  ```

#### Feature: Get Single Job
- **Method:** `GET`
- **Endpoint:** `/api/jobs/:jobId`
- **Description:** Retrieves the full details of a single job.
- **Request Body:** None
- **Success Response (200):**
  ```json
  {
    "id": "job-1",
    "title": "Simple Website for a Local Cafe",
    "description": "Need a student to build a one-page responsive website...",
    "skills": ["HTML", "CSS", "Web Design"],
    "payment": 4000,
    "sos": false,
    "location": "Panjim, Goa",
    "status": "open",
    "posterId": "user-1",
    "workerId": null,
    "applicants": ["user-3"],
    "createdAt": "2023-10-27T10:00:00Z"
  }
  ```
- **Error Response (404):**
  ```json
  {
    "message": "Job not found."
  }
  ```

#### Feature: Post a New Job
- **Method:** `POST`
- **Endpoint:** `/api/jobs`
- **Description:** Creates a new job posting.
- **Request Body:**
  ```json
  {
    "title": "Urgent: Edit a Short College Project Video",
    "description": "Need to quickly edit a 5-minute video. Just trimming clips and adding music.",
    "skills": ["Video Editing"],
    "payment": 1500,
    "location": "Remote",
    "sos": true
  }
  ```
- **Success Response (201):**
  ```json
  {
    "id": "job-10",
    "title": "Urgent: Edit a Short College Project Video",
    "description": "Need to quickly edit a 5-minute video. Just trimming clips and adding music.",
    "skills": ["Video Editing"],
    "payment": 1500,
    "location": "Remote",
    "sos": true,
    "status": "open",
    "posterId": "user-4", // ID of the authenticated user
    "workerId": null,
    "applicants": [],
    "createdAt": "2023-10-28T12:00:00Z"
  }
  ```

#### Feature: Apply for a Job
- **Method:** `POST`
- **Endpoint:** `/api/jobs/:jobId/apply`
- **Description:** Allows the authenticated user to apply for a job.
- **Request Body:** None
- **Success Response (200):**
  ```json
  {
    "message": "Application successful."
  }
  ```
- **Error Response(s) (404, 409):**
  ```json
  {
    "message": "Job not found." // 404
  }
  ```
  ```json
  {
    "message": "You have already applied for this job." // 409
  }
  ```

#### Feature: Select an Applicant
- **Method:** `PUT`
- **Endpoint:** `/api/jobs/:jobId/assign`
- **Description:** Assigns a job to a specific applicant. Only the job poster can perform this action.
- **Request Body:**
  ```json
  {
    "applicantId": "user-2"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "message": "Job assigned successfully to user-2."
  }
  ```
- **Error Response (403):**
  ```json
  {
    "message": "Only the job poster can perform this action."
  }
  ```

#### Feature: Mark Job as Complete
- **Method:** `PUT`
- **Endpoint:** `/api/jobs/:jobId/complete`
- **Description:** Marks a job as completed. Only the assigned worker can perform this action.
- **Request Body:** None
- **Success Response (200):**
  ```json
  {
    "message": "Job marked as complete."
  }
  ```
- **Error Response (403):**
  ```json
  {
    "message": "Only the assigned worker can mark this job as complete."
  }
  ```

### Chat

#### Feature: Get Chat Messages
- **Method:** `GET`
- **Endpoint:** `/api/jobs/:jobId/messages`
- **Description:** Retrieves all chat messages for a specific job. Only accessible to the poster and assigned worker.
- **Request Body:** None
- **Success Response (200):**
  ```json
  [
    {
      "id": "msg-1",
      "jobId": "job-2",
      "senderId": "user-3",
      "content": "Hi! I can start tomorrow.",
      "timestamp": "2023-10-27T11:00:00Z"
    },
    {
      "id": "msg-2",
      "jobId": "job-2",
      "senderId": "user-2",
      "content": "Perfect, see you then!",
      "timestamp": "2023-10-27T11:01:00Z"
    }
  ]
  ```
- **Error Response (403):**
  ```json
  {
    "message": "You do not have access to this chat."
  }
  ```

#### Feature: Send Chat Message
- **Method:** `POST`
- **Endpoint:** `/api/jobs/:jobId/messages`
- **Description:** Sends a new message in the chat for a job.
- **Request Body:**
  ```json
  {
    "content": "Sounds good. What time?"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "id": "msg-3",
    "jobId": "job-2",
    "senderId": "user-3", // ID of authenticated user
    "content": "Sounds good. What time?",
    "timestamp": "2023-10-27T11:02:00Z"
  }
  ```
- **Error Response (400):**
  ```json
  {
    "message": "Message content cannot be empty."
  }
  ```
