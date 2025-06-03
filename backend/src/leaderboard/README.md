# Leaderboard APIs

The Leaderboard module provides comprehensive ranking and statistics functionality for the EliteBuilders platform. It supports different time periods, categories, and sorting criteria to create flexible leaderboard views.

## Features

- **Multiple Time Periods**: All-time, yearly, monthly, and weekly leaderboards
- **Category-based Rankings**: Overall, AI/ML, Web Dev, Mobile, Data Science, DevOps, Blockchain
- **Flexible Sorting**: By career score, submission count, average score, win rate, or recent activity
- **User Search**: Find users by username or name
- **Badge Filtering**: Filter for users with badges only
- **Pagination**: Efficient pagination for large datasets
- **User Rankings**: Get individual user ranking information and percentiles

## API Endpoints

### GET /leaderboard

Get the main leaderboard with flexible filtering options.

**Query Parameters:**
- `period` (optional): `all-time` | `yearly` | `monthly` | `weekly` (default: `all-time`)
- `category` (optional): `overall` | `ai-ml` | `web-dev` | `mobile` | `data-science` | `devops` | `blockchain` (default: `overall`)
- `sortBy` (optional): `careerScore` | `submissionCount` | `averageScore` | `winRate` | `recentActivity` (default: `careerScore`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page, max 100 (default: 50)
- `search` (optional): Search term for username/name
- `badgedOnly` (optional): Filter for users with badges (default: false)

**Example Request:**
```
GET /leaderboard?period=monthly&category=ai-ml&page=1&limit=20&search=john
```

**Response:**
```json
{
  "entries": [
    {
      "rank": 1,
      "user": {
        "id": 123,
        "username": "john_doe",
        "name": "John Doe",
        "avatar": "https://example.com/avatar.jpg",
        "location": "San Francisco, CA",
        "githubUrl": "https://github.com/johndoe"
      },
      "careerScore": 2450.75,
      "submissionCount": 15,
      "averageScore": 87.5,
      "winRate": 73.33,
      "badges": [
        {
          "id": 1,
          "name": "Top 10%",
          "type": "TOP_10_PERCENT",
          "imageUrl": "https://example.com/badge.png"
        }
      ],
      "recentSubmissions": [
        {
          "id": 456,
          "challengeTitle": "AI Recommendation Engine",
          "score": 95.0,
          "createdAt": "2024-01-15T10:30:00Z"
        }
      ],
      "monthlyScore": 450.25
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "period": "monthly",
  "category": "ai-ml",
  "lastUpdated": "2024-01-20T12:00:00Z"
}
```

### GET /leaderboard/global

Get the global all-time leaderboard.

**Query Parameters:** Same as main leaderboard except `period` and `category` are forced to `all-time` and `overall`.

### GET /leaderboard/monthly

Get the monthly leaderboard.

**Query Parameters:** Same as main leaderboard except `period` is forced to `monthly`.

### GET /leaderboard/categories/:category

Get leaderboard for a specific category.

**URL Parameters:**
- `category`: The category slug (e.g., `ai-ml`, `web-dev`)

### GET /leaderboard/top-performers

Get the top performers (global all-time).

**Query Parameters:**
- `limit` (optional): Number of entries to return (default: 10)

**Response:** Array of `LeaderboardEntry` objects.

### GET /leaderboard/monthly-champions

Get the monthly champions.

**Query Parameters:**
- `limit` (optional): Number of entries to return (default: 10)

**Response:** Array of `LeaderboardEntry` objects.

### GET /leaderboard/sponsor-favorites

Get users who are sponsor favorites (have SPONSOR_FAVORITE badges).

**Query Parameters:**
- `limit` (optional): Number of entries to return (default: 10)

**Response:** Array of `LeaderboardEntry` objects.

### GET /leaderboard/user/:userId/ranking

Get ranking information for a specific user.

**URL Parameters:**
- `userId`: The user ID

**Query Parameters:**
- `category` (optional): Category for ranking calculation (default: `overall`)

**Response:**
```json
{
  "globalRank": 42,
  "monthlyRank": 15,
  "categoryRank": 28,
  "totalUsers": 1250,
  "careerScore": 1875.50,
  "percentile": 97
}
```

### GET /leaderboard/stats

Get overview statistics for the leaderboard.

**Response:**
```json
{
  "topPerformers": [...], // Top 3 performers
  "monthlyChampions": [...], // Top 3 monthly champions
  "sponsorFavorites": [...], // Top 3 sponsor favorites
  "lastUpdated": "2024-01-20T12:00:00Z"
}
```

## Data Types

### LeaderboardEntry

```typescript
interface LeaderboardEntry {
  rank: number;
  user: {
    id: number;
    username: string;
    name: string | null;
    avatar: string | null;
    location: string | null;
    githubUrl: string | null;
  };
  careerScore: number;
  submissionCount: number;
  averageScore: number;
  winRate: number;
  badges: Badge[];
  recentSubmissions: RecentSubmission[];
  monthlyScore?: number; // Only present for monthly period
  weeklyScore?: number; // Only present for weekly period
}
```

### UserRankingInfo

```typescript
interface UserRankingInfo {
  globalRank: number;
  monthlyRank: number;
  categoryRank: number;
  totalUsers: number;
  careerScore: number;
  percentile: number;
}
```

## Scoring Algorithm

### Career Score
The primary ranking metric that combines:
- Submission scores weighted by challenge prizes
- Consistency bonuses for regular participation
- Badge achievements

### Win Rate
Percentage of submissions scoring 80 or above.

### Period Scores
For monthly/weekly leaderboards, scores are calculated based on submissions within that time period, weighted by challenge prizes.

## Performance Considerations

- Leaderboard queries are optimized with proper indexing
- Pagination is enforced to prevent large data transfers
- Statistics are calculated efficiently using database aggregations
- Consider implementing Redis caching for frequently accessed leaderboards

## Usage Examples

### Frontend Integration

```typescript
// Get monthly AI/ML leaderboard
const leaderboard = await fetch('/api/leaderboard?period=monthly&category=ai-ml&limit=50');

// Get user's ranking
const userRank = await fetch('/api/leaderboard/user/123/ranking');

// Get overview stats for dashboard
const stats = await fetch('/api/leaderboard/stats');
```

### Search and Filter

```typescript
// Search for users
const results = await fetch('/api/leaderboard?search=john&badgedOnly=true');

// Get top performers this week
const weekly = await fetch('/api/leaderboard?period=weekly&limit=10');
``` 