# Challenges API Documentation

This document describes the API endpoints for the challenges module in the EliteBuilders platform.

## Base URL
```
/challenges
```

## Authentication
Most endpoints require JWT authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Challenge
Create a new challenge (requires authentication).

**POST** `/challenges`

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "title": "Build an AI Chatbot",
  "description": "Create a conversational AI chatbot using modern LLM technology. The chatbot should be able to handle multi-turn conversations and provide helpful responses.",
  "dataset": "https://example.com/dataset.zip",
  "rubric": "Projects will be evaluated on: 1) Functionality (40%), 2) Code quality (30%), 3) User experience (20%), 4) Innovation (10%)",
  "deadline": "2024-06-15T23:59:59Z",
  "prize": 5000
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Build an AI Chatbot",
  "description": "Create a conversational AI chatbot...",
  "dataset": "https://example.com/dataset.zip",
  "rubric": "Projects will be evaluated on...",
  "deadline": "2024-06-15T23:59:59.000Z",
  "prize": 5000,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z",
  "creatorId": 1,
  "creator": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "avatar": "https://example.com/avatar.jpg"
  },
  "_count": {
    "participants": 0,
    "submissions": 0
  }
}
```

### 2. Get All Challenges
Retrieve a paginated list of challenges with optional filtering.

**GET** `/challenges`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in title and description
- `creatorId` (optional): Filter by creator ID
- `includeExpired` (optional): Include expired challenges (default: false)
- `sortBy` (optional): Sort field - `createdAt`, `deadline`, or `prize` (default: `createdAt`)
- `sortOrder` (optional): Sort order - `asc` or `desc` (default: `desc`)

**Example Request:**
```
GET /challenges?page=1&limit=5&search=AI&sortBy=deadline&sortOrder=asc
```

**Response:**
```json
{
  "challenges": [
    {
      "id": 1,
      "title": "Build an AI Chatbot",
      "description": "Create a conversational AI chatbot...",
      "dataset": "https://example.com/dataset.zip",
      "rubric": "Projects will be evaluated on...",
      "deadline": "2024-06-15T23:59:59.000Z",
      "prize": 5000,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z",
      "creatorId": 1,
      "creator": {
        "id": 1,
        "name": "John Doe",
        "username": "johndoe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "_count": {
        "participants": 15,
        "submissions": 8
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 25,
    "totalPages": 5
  }
}
```

### 3. Get Challenge by ID
Retrieve a specific challenge with detailed information.

**GET** `/challenges/:id`

**Parameters:**
- `id`: Challenge ID (integer)

**Response:**
```json
{
  "id": 1,
  "title": "Build an AI Chatbot",
  "description": "Create a conversational AI chatbot...",
  "dataset": "https://example.com/dataset.zip",
  "rubric": "Projects will be evaluated on...",
  "deadline": "2024-06-15T23:59:59.000Z",
  "prize": 5000,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z",
  "creatorId": 1,
  "creator": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "avatar": "https://example.com/avatar.jpg"
  },
  "participants": [
    {
      "id": 2,
      "name": "Jane Smith",
      "username": "janesmith",
      "avatar": "https://example.com/avatar2.jpg"
    }
  ],
  "submissions": [
    {
      "id": 1,
      "repoUrl": "https://github.com/user/project",
      "pitchDeck": "https://example.com/deck.pdf",
      "demoVideo": "https://example.com/demo.mp4",
      "score": 85.5,
      "status": "SCORED",
      "createdAt": "2024-02-01T10:00:00.000Z",
      "updatedAt": "2024-02-05T10:00:00.000Z",
      "userId": 2,
      "challengeId": 1,
      "user": {
        "id": 2,
        "name": "Jane Smith",
        "username": "janesmith",
        "avatar": "https://example.com/avatar2.jpg"
      }
    }
  ],
  "_count": {
    "participants": 15,
    "submissions": 8
  },
  "isParticipating": false,
  "hasSubmitted": false,
  "isExpired": false
}
```

### 4. Update Challenge
Update an existing challenge (requires authentication and ownership).

**PATCH** `/challenges/:id`

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

**Parameters:**
- `id`: Challenge ID (integer)

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Challenge Title",
  "description": "Updated description",
  "dataset": "https://example.com/new-dataset.zip",
  "rubric": "Updated evaluation criteria",
  "deadline": "2024-07-15T23:59:59Z",
  "prize": 7500
}
```

**Response:** Same as Create Challenge response

**Error Responses:**
- `403 Forbidden`: Only the challenge creator can update
- `400 Bad Request`: Cannot update an expired challenge
- `404 Not Found`: Challenge not found

### 5. Delete Challenge
Delete a challenge (requires authentication and ownership).

**DELETE** `/challenges/:id`

**Headers:**
- `Authorization: Bearer <token>` (required)

**Parameters:**
- `id`: Challenge ID (integer)

**Response:**
```json
{
  "message": "Challenge deleted successfully"
}
```

**Error Responses:**
- `403 Forbidden`: Only the challenge creator can delete
- `400 Bad Request`: Cannot delete a challenge that has submissions
- `404 Not Found`: Challenge not found

### 6. Join Challenge
Join a challenge as a participant (requires authentication).

**POST** `/challenges/:id/participate`

**Headers:**
- `Authorization: Bearer <token>` (required)

**Parameters:**
- `id`: Challenge ID (integer)

**Response:**
```json
{
  "message": "Successfully joined the challenge"
}
```

**Error Responses:**
- `400 Bad Request`: Cannot participate in an expired challenge
- `400 Bad Request`: Already participating in this challenge
- `404 Not Found`: Challenge not found

### 7. Leave Challenge
Leave a challenge (requires authentication).

**DELETE** `/challenges/:id/participate`

**Headers:**
- `Authorization: Bearer <token>` (required)

**Parameters:**
- `id`: Challenge ID (integer)

**Response:**
```json
{
  "message": "Successfully left the challenge"
}
```

**Error Responses:**
- `400 Bad Request`: Not participating in this challenge
- `400 Bad Request`: Cannot leave a challenge after submitting
- `404 Not Found`: Challenge not found

### 8. Get Challenge Leaderboard
Get the leaderboard for a specific challenge.

**GET** `/challenges/:id/leaderboard`

**Parameters:**
- `id`: Challenge ID (integer)

**Response:**
```json
{
  "challenge": {
    "id": 1,
    "title": "Build an AI Chatbot",
    "deadline": "2024-06-15T23:59:59.000Z"
  },
  "leaderboard": [
    {
      "rank": 1,
      "user": {
        "id": 2,
        "name": "Jane Smith",
        "username": "janesmith",
        "avatar": "https://example.com/avatar2.jpg"
      },
      "score": 95.5,
      "submittedAt": "2024-02-01T10:00:00.000Z"
    },
    {
      "rank": 2,
      "user": {
        "id": 3,
        "name": "Bob Johnson",
        "username": "bobjohnson",
        "avatar": "https://example.com/avatar3.jpg"
      },
      "score": 87.2,
      "submittedAt": "2024-02-02T14:30:00.000Z"
    }
  ]
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Successful GET requests
- `201 Created`: Successful POST requests
- `400 Bad Request`: Invalid request data or business logic violations
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side errors

Error response format:
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

## Data Models

### Challenge
```typescript
interface Challenge {
  id: number;
  title: string;
  description: string;
  dataset?: string;
  rubric: string;
  deadline: Date;
  prize?: number;
  createdAt: Date;
  updatedAt: Date;
  creatorId: number;
  creator: User;
  participants: User[];
  submissions: Submission[];
  _count: {
    participants: number;
    submissions: number;
  };
}
```

### User (subset)
```typescript
interface User {
  id: number;
  name?: string;
  username: string;
  avatar?: string;
}
```

### Submission (subset)
```typescript
interface Submission {
  id: number;
  repoUrl: string;
  pitchDeck: string;
  demoVideo: string;
  score?: number;
  status: 'PENDING' | 'UNDER_REVIEW' | 'SCORED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  challengeId: number;
  user: User;
}
``` 