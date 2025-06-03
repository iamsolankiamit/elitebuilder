# Badges API

The Badges module provides comprehensive badge management functionality for the EliteBuilders platform, with special focus on sponsor badge operations. Sponsors can award badges to recognize outstanding submissions and participants.

## Features

- **Badge Management**: Create, view, and manage badges
- **Sponsor Badge Awards**: Sponsors can award special recognition badges
- **Badge Statistics**: Track badge distribution and analytics
- **User Badge Profiles**: View user badge collections
- **Activity Tracking**: Monitor sponsor badge awarding activity

## Badge Types

- `TOP_10_PERCENT` - Awarded to top 10% performers
- `CATEGORY_WINNER` - Winner in specific challenge categories
- `SPONSOR_FAVORITE` - Special recognition from sponsors
- `FIRST_SUBMISSION` - First submission to a challenge
- `PERFECT_SCORE` - Perfect score achievement
- `SEASON_CHAMPION` - Season/period champion

## API Endpoints

### POST /badges

Create a new badge (Admin only).

**Authentication**: Required (Admin only)

**Request Body:**
```json
{
  "name": "Innovation Excellence",
  "description": "Awarded for exceptional innovation in AI solutions",
  "imageUrl": "https://cdn.elitebuilders.dev/badges/innovation.png",
  "type": "CATEGORY_WINNER",
  "userId": 123
}
```

**Response:**
```json
{
  "id": 456,
  "name": "Innovation Excellence",
  "description": "Awarded for exceptional innovation in AI solutions",
  "imageUrl": "https://cdn.elitebuilders.dev/badges/innovation.png",
  "type": "CATEGORY_WINNER",
  "userId": 123,
  "createdAt": "2024-01-20T10:30:00Z"
}
```

### POST /badges/sponsor/award

Award a sponsor favorite badge (Sponsors only).

**Authentication**: Required (Sponsors/Admins only)

**Request Body:**
```json
{
  "userId": 123,
  "challengeId": 456,
  "reason": "Outstanding implementation of AI recommendation system",
  "customName": "AI Innovation Award",
  "customDescription": "Exceptional work on the recommendation engine challenge"
}
```

**Response:**
```json
{
  "id": 789,
  "name": "AI Innovation Award",
  "description": "Exceptional work on the recommendation engine challenge",
  "imageUrl": "https://cdn.elitebuilders.dev/badges/sponsor-favorite.png",
  "type": "SPONSOR_FAVORITE",
  "userId": 123,
  "createdAt": "2024-01-20T10:30:00Z"
}
```

### GET /badges

Get badges with filtering and pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `userId` (optional): Filter by user ID
- `type` (optional): Filter by badge type
- `search` (optional): Search in badge name/description

**Example Request:**
```
GET /badges?type=SPONSOR_FAVORITE&page=1&limit=10&search=innovation
```

**Response:**
```json
{
  "badges": [
    {
      "id": 789,
      "name": "AI Innovation Award",
      "description": "Exceptional work on the recommendation engine challenge",
      "imageUrl": "https://cdn.elitebuilders.dev/badges/sponsor-favorite.png",
      "type": "SPONSOR_FAVORITE",
      "userId": 123,
      "createdAt": "2024-01-20T10:30:00Z",
      "user": {
        "id": 123,
        "username": "john_doe",
        "name": "John Doe",
        "avatar": "https://github.com/johndoe.png"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### GET /badges/stats

Get badge statistics and overview.

**Response:**
```json
{
  "totalBadges": 150,
  "badgesByType": {
    "TOP_10_PERCENT": 45,
    "CATEGORY_WINNER": 30,
    "SPONSOR_FAVORITE": 25,
    "FIRST_SUBMISSION": 20,
    "PERFECT_SCORE": 15,
    "SEASON_CHAMPION": 15
  },
  "recentBadges": [
    {
      "id": 789,
      "name": "AI Innovation Award",
      "description": "Exceptional work on the recommendation engine challenge",
      "imageUrl": "https://cdn.elitebuilders.dev/badges/sponsor-favorite.png",
      "type": "SPONSOR_FAVORITE",
      "userId": 123,
      "createdAt": "2024-01-20T10:30:00Z",
      "user": {
        "id": 123,
        "username": "john_doe",
        "name": "John Doe",
        "avatar": "https://github.com/johndoe.png"
      }
    }
  ]
}
```

### GET /badges/sponsor/favorites

Get users who are sponsor favorites.

**Query Parameters:**
- `limit` (optional): Number of entries to return (default: 10)

**Response:**
```json
[
  {
    "rank": 1,
    "badge": {
      "id": 789,
      "name": "AI Innovation Award",
      "description": "Exceptional work on the recommendation engine challenge",
      "imageUrl": "https://cdn.elitebuilders.dev/badges/sponsor-favorite.png",
      "type": "SPONSOR_FAVORITE",
      "createdAt": "2024-01-20T10:30:00Z"
    },
    "user": {
      "id": 123,
      "username": "john_doe",
      "name": "John Doe",
      "avatar": "https://github.com/johndoe.png",
      "location": "San Francisco, CA",
      "githubUrl": "https://github.com/johndoe",
      "careerScore": 2450.75
    }
  }
]
```

### GET /badges/sponsor/activity

Get sponsor badge awarding activity (Sponsors only).

**Authentication**: Required (Sponsors/Admins only)

**Query Parameters:**
- `limit` (optional): Number of entries to return (default: 20)

**Response:**
```json
[
  {
    "badgeId": 789,
    "badge": {
      "id": 789,
      "name": "AI Innovation Award",
      "description": "Exceptional work on the recommendation engine challenge",
      "imageUrl": "https://cdn.elitebuilders.dev/badges/sponsor-favorite.png",
      "type": "SPONSOR_FAVORITE",
      "createdAt": "2024-01-20T10:30:00Z"
    },
    "awardedBy": {
      "id": 456,
      "name": "TechCorp",
      "username": "techcorp_sponsor"
    },
    "awardedTo": {
      "id": 123,
      "name": "John Doe",
      "username": "john_doe"
    },
    "createdAt": "2024-01-20T10:30:00Z"
  }
]
```

### GET /badges/user/:userId

Get badges for a specific user.

**URL Parameters:**
- `userId`: The user ID

**Response:**
```json
{
  "badges": [
    {
      "id": 789,
      "name": "AI Innovation Award",
      "description": "Exceptional work on the recommendation engine challenge",
      "imageUrl": "https://cdn.elitebuilders.dev/badges/sponsor-favorite.png",
      "type": "SPONSOR_FAVORITE",
      "createdAt": "2024-01-20T10:30:00Z"
    },
    {
      "id": 790,
      "name": "Top 10%",
      "description": "Ranked in top 10% of all participants",
      "imageUrl": "https://cdn.elitebuilders.dev/badges/top-10.png",
      "type": "TOP_10_PERCENT",
      "createdAt": "2024-01-15T08:20:00Z"
    }
  ],
  "stats": {
    "totalBadges": 2,
    "badgesByType": {
      "SPONSOR_FAVORITE": 1,
      "TOP_10_PERCENT": 1
    }
  }
}
```

### DELETE /badges/:badgeId

Delete a badge (Admins or badge owner only).

**Authentication**: Required

**URL Parameters:**
- `badgeId`: The badge ID to delete

**Response:** 200 OK (no content)

## Data Types

### Badge

```typescript
interface Badge {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  type: BadgeType;
  userId: number;
  createdAt: Date;
}
```

### BadgeStats

```typescript
interface BadgeStats {
  totalBadges: number;
  badgesByType: Record<BadgeType, number>;
  recentBadges: Badge[];
}
```

### SponsorBadgeActivity

```typescript
interface SponsorBadgeActivity {
  badgeId: number;
  badge: Badge;
  awardedBy: {
    id: number;
    name: string;
    username: string;
  };
  awardedTo: {
    id: number;
    name: string;
    username: string;
  };
  challengeId?: number;
  challenge?: {
    id: number;
    title: string;
  };
  reason?: string;
  createdAt: Date;
}
```

## Sponsor Badge Features

### Recognition System
Sponsors can award special badges to recognize:
- Outstanding submissions
- Innovative solutions
- Best practices implementation
- Creative approaches
- Exceptional presentations

### Award Criteria
- User must exist in the system
- If challenge is specified, user must have participated
- Sponsors can provide custom badge names and descriptions
- Prevents duplicate awards for same badge/user combination

### Tracking and Analytics
- Activity logs for sponsor badge awards
- Badge distribution statistics
- User badge profiles and achievements
- Recent badge activity feeds

## Permissions

### Badge Creation
- **General Badges**: Admin only
- **Sponsor Badges**: Sponsors and Admins

### Badge Viewing
- **Public**: Badge lists, stats, sponsor favorites
- **Private**: User-specific badge collections, sponsor activity

### Badge Deletion
- **Admins**: Can delete any badge
- **Users**: Can delete their own badges only

## Usage Examples

### Frontend Integration

```typescript
// Award sponsor badge
const awardBadge = async (userId: number, challengeId: number) => {
  const response = await fetch('/api/badges/sponsor/award', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      userId,
      challengeId,
      reason: 'Outstanding AI implementation',
      customName: 'AI Excellence',
      customDescription: 'Exceptional work on machine learning solution'
    })
  });
  return response.json();
};

// Get user badges
const getUserBadges = async (userId: number) => {
  const response = await fetch(`/api/badges/user/${userId}`);
  return response.json();
};

// Get sponsor favorites
const getSponsorFavorites = async () => {
  const response = await fetch('/api/badges/sponsor/favorites?limit=10');
  return response.json();
};
```

### Sponsor Dashboard Integration

```typescript
// Sponsor activity tracking
const getSponsorActivity = async () => {
  const response = await fetch('/api/badges/sponsor/activity', {
    headers: {
      'Authorization': `Bearer ${sponsorToken}`
    }
  });
  return response.json();
};

// Badge statistics for sponsors
const getBadgeStats = async () => {
  const response = await fetch('/api/badges/stats');
  return response.json();
};
```

## Error Handling

### Common Error Responses

**400 Bad Request**
```json
{
  "statusCode": 400,
  "message": "User already has this badge",
  "error": "Bad Request"
}
```

**403 Forbidden**
```json
{
  "statusCode": 403,
  "message": "Only sponsors can award sponsor badges",
  "error": "Forbidden"
}
```

**404 Not Found**
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

## Future Enhancements

- [ ] Badge verification system
- [ ] NFT integration for blockchain badges
- [ ] Badge marketplace for trading
- [ ] Advanced badge criteria and rules engine
- [ ] Automated badge awarding based on achievements
- [ ] Badge recommendation system for sponsors
- [ ] Integration with external recognition platforms 