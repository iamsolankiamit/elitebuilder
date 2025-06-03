import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function verifyBadges() {
  console.log('🔍 Verifying badge seed data...\n');

  try {
    // Get all badges with user information
    const badges = await prisma.badge.findMany({
      include: {
        user: {
          select: {
            name: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: [
        { user: { name: 'asc' } },
        { type: 'asc' },
      ],
    });

    console.log(`📊 Total badges created: ${badges.length}\n`);

    // Group badges by user
    const badgesByUser = badges.reduce((acc, badge) => {
      const userName = badge.user.name || 'Unknown';
      if (!acc[userName]) {
        acc[userName] = [];
      }
      acc[userName].push(badge);
      return acc;
    }, {} as Record<string, typeof badges>);

    // Display badges by user
    Object.entries(badgesByUser).forEach(([userName, userBadges]) => {
      console.log(`👤 ${userName} (${userBadges.length} badges):`);
      userBadges.forEach((badge) => {
        const emoji = getEmojiForBadgeType(badge.type);
        console.log(`   ${emoji} ${badge.name} - ${badge.description}`);
      });
      console.log('');
    });

    // Badge type summary
    const badgeTypeCounts = badges.reduce((acc, badge) => {
      acc[badge.type] = (acc[badge.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📈 Badge type distribution:');
    Object.entries(badgeTypeCounts).forEach(([type, count]) => {
      const emoji = getEmojiForBadgeType(type);
      console.log(`   ${emoji} ${type}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error verifying badges:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getEmojiForBadgeType(type: string): string {
  const emojiMap: Record<string, string> = {
    'PERFECT_SCORE': '🏆',
    'CATEGORY_WINNER': '🥇',
    'TOP_10_PERCENT': '⭐',
    'FIRST_SUBMISSION': '🚀',
    'SPONSOR_FAVORITE': '❤️',
    'SEASON_CHAMPION': '👑',
  };
  return emojiMap[type] || '🎖️';
}

verifyBadges(); 