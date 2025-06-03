# Badges Frontend Implementation Guide

## Overview

The badges frontend provides a comprehensive system for displaying, managing, and awarding badges in the EliteBuilders platform. It includes both user-facing displays and sponsor management tools.

## 🎯 Features Implemented

### 1. **Badge Display Components**
- **BadgeDisplay**: Reusable component for showing individual badges
- **BadgeList**: Filterable and paginated list of badges
- **BadgeStats**: Dashboard with badge statistics and analytics
- **SponsorFavorites**: Leaderboard-style display of sponsor favorite badges

### 2. **Sponsor Badge Management**
- **SponsorBadgeAward**: Dialog for sponsors to award custom badges
- **QuickSponsorAward**: Compact version for use in cards/lists
- Real-time badge awarding with form validation
- Custom badge names and descriptions

### 3. **Main Badges Page**
- Comprehensive badges overview at `/badges`
- Badge statistics dashboard
- Sponsor favorites showcase
- Complete badge catalog with search and filtering
- Badge category explanations

## 📁 File Structure

```
frontend/
├── components/badges/
│   ├── badge-display.tsx       # Individual badge display
│   ├── badge-list.tsx         # Badge list with filtering
│   ├── badge-stats.tsx        # Statistics dashboard
│   ├── sponsor-favorites.tsx  # Sponsor favorites display
│   ├── sponsor-badge-award.tsx # Badge awarding interface
│   └── index.ts              # Component exports
├── hooks/
│   └── use-badges.ts         # Badge-related API hooks
├── lib/
│   ├── api.ts               # Badge API client (added badgesApi)
│   └── types.ts             # Badge type definitions
├── app/badges/
│   └── page.tsx             # Main badges page
└── components/ui/           # Created missing UI components
    ├── label.tsx
    ├── dialog.tsx
    └── alert.tsx
```

## 🎨 Components Usage

### BadgeDisplay
Display individual badges with customizable appearance:

```tsx
import { BadgeDisplay } from '@/components/badges';

<BadgeDisplay
  badge={badge}
  size="md"              // 'sm' | 'md' | 'lg'
  showUser={true}        // Show badge owner info
  showDescription={true} // Show badge description
  interactive={true}     // Enable hover effects
  onClick={handleClick}  // Click handler
/>
```

### BadgeList
Show filterable lists of badges:

```tsx
import { BadgeList } from '@/components/badges';

<BadgeList
  title="User Badges"
  userId={123}           // Filter by user
  showFilters={true}     // Enable search/filters
  showPagination={true}  // Enable pagination
  limit={20}            // Items per page
  badgeSize="md"        // Badge size
  showUserInfo={false}  // Hide user info when filtering by user
/>
```

### SponsorBadgeAward
Allow sponsors to award badges:

```tsx
import { SponsorBadgeAward } from '@/components/badges';

<SponsorBadgeAward
  userId={123}
  challengeId={456}      // Optional challenge context
  userInfo={{           // Optional user display
    username: "johndoe",
    name: "John Doe",
    avatar: "https://..."
  }}
  triggerText="Award Badge"
  triggerVariant="premium"
/>
```

### BadgeStats
Display badge analytics:

```tsx
import { BadgeStats } from '@/components/badges';

<BadgeStats 
  showRecentBadges={true}  // Show recent badges section
  className="my-8"
/>
```

## 🔗 API Integration

### Available Hooks

```tsx
import {
  useBadges,              // Get badges with filtering
  useBadgeStats,          // Get badge statistics
  useSponsorFavorites,    // Get sponsor favorites
  useUserBadges,          // Get user's badges
  useAwardSponsorBadge,   // Award sponsor badge
  useMyBadges,            // Get current user's badges
  useBadgeSearch,         // Search badges
  useRecentBadges,        // Get recent badges
} from '@/hooks/use-badges';
```

### Example Usage

```tsx
// Get all badges with search
const { data: badges, isLoading } = useBadges({
  search: 'sponsor',
  type: BadgeType.SPONSOR_FAVORITE,
  page: 1,
  limit: 20
});

// Award a sponsor badge
const awardBadge = useAwardSponsorBadge();

const handleAward = async () => {
  await awardBadge.mutateAsync({
    userId: 123,
    challengeId: 456,
    customName: "Innovation Excellence",
    customDescription: "Outstanding AI innovation",
    reason: "Exceptional work on the recommendation engine"
  });
};
```

## 🎭 Badge Types & Styling

### Badge Types
- `TOP_10_PERCENT` - Top performers (emerald/cyan gradient)
- `CATEGORY_WINNER` - Category winners (yellow/orange gradient)
- `SPONSOR_FAVORITE` - Sponsor picks (purple/pink gradient)
- `FIRST_SUBMISSION` - First submission (blue/indigo gradient)
- `PERFECT_SCORE` - Perfect scores (red/pink gradient)
- `SEASON_CHAMPION` - Season winners (amber/yellow gradient)

### Visual Features
- Gradient backgrounds for each badge type
- Emoji icons for visual recognition
- Sparkle animations for sponsor favorites
- Responsive sizing (sm/md/lg)
- Interactive hover effects
- Loading and error states

## 🚀 Integration Examples

### In Leaderboard Components
```tsx
import { QuickSponsorAward } from '@/components/badges';

// Add to leaderboard entries
<QuickSponsorAward
  userId={entry.user.id}
  userInfo={entry.user}
  className="ml-2"
/>
```

### In User Profiles
```tsx
import { BadgeList } from '@/components/badges';

// Show user's badges
<BadgeList
  userId={user.id}
  title={`${user.name}'s Badges`}
  showFilters={false}
  badgeSize="sm"
  limit={12}
/>
```

### In Challenge Pages
```tsx
import { SponsorBadgeAward } from '@/components/badges';

// Award badges to submission authors
<SponsorBadgeAward
  userId={submission.userId}
  challengeId={challenge.id}
  userInfo={submission.user}
  challengeInfo={{ title: challenge.title }}
/>
```

## 🔐 Permissions

### Sponsor Features
- Only users with `isSponsor: true` or `isAdmin: true` can:
  - Award sponsor badges
  - View sponsor badge activity
  - Access sponsor management features

### Public Features
- All users can view:
  - Badge galleries
  - Badge statistics
  - Sponsor favorites
  - User badge profiles

## 🎨 Customization

### Theming
The components use Tailwind CSS classes and respect the existing design system:
- Dark/light mode support
- Consistent spacing and typography
- Gradient effects for visual appeal
- Responsive design

### Animations
- Framer Motion for smooth transitions
- Staggered animations for lists
- Hover and tap effects
- Loading states with spinners

## 📱 Responsive Design

The badges interface is fully responsive:
- Mobile-first grid layouts
- Adaptive badge sizes
- Collapsible filters on mobile
- Touch-friendly interactions

## 🚀 Getting Started

1. **Add to existing pages**: Import badge components into your existing pages
2. **Navigation**: Badge links are already added to the header navigation
3. **API Integration**: The badges API is integrated into the main API client
4. **Permissions**: Sponsor features will automatically show/hide based on user permissions

The badges frontend is now ready to use and provides a complete badge management experience for both users and sponsors! 