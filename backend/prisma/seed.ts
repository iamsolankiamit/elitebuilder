import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed process...');

  // Create sponsor/admin users first
  const sponsorUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@elitebuilders.com' },
      update: {},
      create: {
        email: 'admin@elitebuilders.com',
        name: 'EliteBuilders Admin',
        username: 'elitebuilders_admin',
        avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
        bio: 'Official EliteBuilders platform administrator',
        location: 'San Francisco, CA',
        timezone: 'America/Los_Angeles',
        isSponsor: true,
        isAdmin: true,
        careerScore: 1000,
      },
    }),
    prisma.user.upsert({
      where: { email: 'openai@sponsor.com' },
      update: {},
      create: {
        email: 'openai@sponsor.com',
        name: 'OpenAI',
        username: 'openai_sponsor',
        avatar: 'https://avatars.githubusercontent.com/u/14957082?v=4',
        bio: 'AI research company creating safe AGI',
        location: 'San Francisco, CA',
        timezone: 'America/Los_Angeles',
        isSponsor: true,
        isAdmin: false,
        careerScore: 950,
      },
    }),
    prisma.user.upsert({
      where: { email: 'anthropic@sponsor.com' },
      update: {},
      create: {
        email: 'anthropic@sponsor.com',
        name: 'Anthropic',
        username: 'anthropic_sponsor',
        avatar: 'https://avatars.githubusercontent.com/u/48770040?v=4',
        bio: 'AI safety research company',
        location: 'San Francisco, CA',
        timezone: 'America/Los_Angeles',
        isSponsor: true,
        isAdmin: false,
        careerScore: 920,
      },
    }),
    prisma.user.upsert({
      where: { email: 'google@sponsor.com' },
      update: {},
      create: {
        email: 'google@sponsor.com',
        name: 'Google AI',
        username: 'google_ai_sponsor',
        avatar: 'https://avatars.githubusercontent.com/u/1342004?v=4',
        bio: 'Google AI research and products',
        location: 'Mountain View, CA',
        timezone: 'America/Los_Angeles',
        isSponsor: true,
        isAdmin: false,
        careerScore: 980,
      },
    }),
  ]);

  console.log('✅ Created sponsor users');

  // Create sample challenges
  const challenges = [
    {
      title: 'AI-Powered Customer Support Chatbot',
      description: `Build an intelligent customer support chatbot that can:
      
• Handle common customer inquiries automatically
• Escalate complex issues to human agents
• Learn from customer interactions to improve responses
• Support multiple languages (English, Spanish, French)
• Integrate with existing ticketing systems

**Requirements:**
- Use modern NLP/LLM techniques
- Implement conversation memory and context
- Include sentiment analysis for prioritizing urgent issues
- Create a clean, intuitive chat interface
- Provide analytics dashboard for support managers

**Bonus Points:**
- Voice integration capability
- Real-time translation between languages
- Predictive issue resolution suggestions`,
      dataset: 'https://github.com/microsoft/BotFramework-Samples/tree/main/samples/javascript_nodejs/13.core-bot',
      rubric: `**Evaluation Criteria (100 points total):**

**Technical Implementation (40 points):**
- NLP/LLM integration and effectiveness (15 pts)
- Code quality, architecture, and scalability (15 pts)
- Integration capabilities and API design (10 pts)

**User Experience (25 points):**
- Chat interface design and usability (15 pts)
- Response quality and conversation flow (10 pts)

**Innovation & Features (20 points):**
- Creative problem-solving approaches (10 pts)
- Implementation of bonus features (10 pts)

**Presentation & Documentation (15 points):**
- Code documentation and README quality (8 pts)
- Demo video clarity and completeness (7 pts)`,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      prize: 5000,
      creatorId: sponsorUsers[1].id, // OpenAI
    },
    {
      title: 'Smart Code Review Assistant',
      description: `Develop an AI-powered code review tool that helps developers write better code:

• Automatically detect bugs, security vulnerabilities, and performance issues
• Suggest code improvements and refactoring opportunities
• Enforce coding standards and best practices
• Generate automated test suggestions
• Provide educational explanations for flagged issues

**Technical Stack:**
- Support for JavaScript/TypeScript, Python, and Go
- GitHub/GitLab integration
- VS Code extension (optional but preferred)
- Web dashboard for repository-level insights

**Key Features:**
- Real-time code analysis as developers type
- Contextual suggestions based on project patterns
- Learning from team's coding preferences
- Integration with popular CI/CD pipelines`,
      dataset: 'https://github.com/github/CodeQL',
      rubric: `**Evaluation Criteria (100 points total):**

**Code Analysis Accuracy (35 points):**
- Bug detection effectiveness (15 pts)
- Security vulnerability identification (10 pts)
- Performance issue recognition (10 pts)

**Developer Experience (30 points):**
- IDE/Editor integration quality (15 pts)
- Suggestion relevance and clarity (15 pts)

**Technical Excellence (25 points):**
- Multi-language support implementation (10 pts)
- Integration capabilities (10 pts)
- Performance and scalability (5 pts)

**Documentation & Demo (10 points):**
- Setup and usage documentation (5 pts)
- Demo video showcasing key features (5 pts)`,
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      prize: 7500,
      creatorId: sponsorUsers[2].id, // Anthropic
    },
    {
      title: 'Personal AI Financial Advisor',
      description: `Create a comprehensive AI-powered personal finance management platform:

**Core Functionality:**
• Automated expense tracking and categorization
• Personalized budgeting recommendations
• Investment portfolio analysis and suggestions
• Bill prediction and payment reminders
• Financial goal tracking and planning

**Advanced Features:**
• Risk assessment for investments
• Tax optimization strategies
• Market trend analysis and alerts
• Educational content personalized to user's financial situation
• Integration with major banks and financial institutions

**Security Requirements:**
- Bank-level encryption for all financial data
- Multi-factor authentication
- Compliance with financial regulations (PCI DSS)
- Privacy-first design with user data control`,
      dataset: 'https://www.kaggle.com/datasets/bukolafatunde/personal-finance-tracker',
      rubric: `**Evaluation Criteria (100 points total):**

**AI Accuracy & Intelligence (30 points):**
- Expense categorization accuracy (10 pts)
- Investment recommendation quality (10 pts)
- Financial advice relevance (10 pts)

**Security & Compliance (25 points):**
- Data encryption implementation (10 pts)
- Authentication and authorization (10 pts)
- Privacy controls and compliance (5 pts)

**User Experience (25 points):**
- Interface design and usability (15 pts)
- Mobile responsiveness (10 pts)

**Technical Implementation (20 points):**
- Architecture and scalability (10 pts)
- Third-party integrations (10 pts)`,
      deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
      prize: 10000,
      creatorId: sponsorUsers[3].id, // Google
    },
    {
      title: 'AI-Enhanced Learning Platform',
      description: `Build an adaptive learning platform that personalizes education using AI:

**Platform Features:**
• Adaptive learning paths based on student progress
• Automated content generation for different learning styles
• Real-time difficulty adjustment
• Progress tracking and analytics for educators
• Gamification elements to increase engagement

**AI Capabilities:**
• Natural language processing for automated grading
• Computer vision for interactive exercises
• Recommendation engine for learning resources
• Predictive analytics for identifying at-risk students
• Intelligent tutoring system with conversational AI

**Content Areas (choose 1-2):**
- Mathematics (K-12 or College level)
- Programming fundamentals
- Language learning
- Science (Physics, Chemistry, Biology)`,
      dataset: 'https://www.kaggle.com/datasets/whenamancodes/students-performance-in-exams',
      rubric: `**Evaluation Criteria (100 points total):**

**AI Personalization (35 points):**
- Adaptive learning algorithm effectiveness (20 pts)
- Content recommendation accuracy (15 pts)

**Educational Impact (25 points):**
- Learning outcome improvements (15 pts)
- Engagement and retention features (10 pts)

**Platform Usability (25 points):**
- Student interface design (10 pts)
- Educator dashboard functionality (10 pts)
- Mobile accessibility (5 pts)

**Technical Innovation (15 points):**
- Creative use of AI technologies (10 pts)
- Scalability and performance (5 pts)`,
      deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
      prize: 8000,
      creatorId: sponsorUsers[0].id, // EliteBuilders Admin
    },
    {
      title: 'Smart Home Automation Assistant',
      description: `Develop an intelligent home automation system that learns user preferences:

**Core Features:**
• Voice and app-based control for smart devices
• Automated scheduling based on user behavior patterns
• Energy optimization and cost savings recommendations
• Security monitoring with intelligent alerts
• Integration with popular IoT devices and platforms

**AI Components:**
• Natural language understanding for voice commands
• Machine learning for behavior pattern recognition
• Predictive analytics for energy consumption
• Computer vision for security monitoring
• Anomaly detection for unusual activities

**Technical Requirements:**
- Support for major smart home protocols (Zigbee, Z-Wave, WiFi)
- Mobile app for iOS and Android
- Web dashboard for detailed configuration
- Offline functionality for core features
- Open API for third-party integrations`,
      dataset: 'https://www.kaggle.com/datasets/taweilo/smart-home-dataset-with-weather-information',
      rubric: `**Evaluation Criteria (100 points total):**

**AI Intelligence (30 points):**
- Behavior learning accuracy (15 pts)
- Predictive capabilities (10 pts)
- Voice recognition quality (5 pts)

**Device Integration (25 points):**
- Multi-protocol support (15 pts)
- Device compatibility range (10 pts)

**User Experience (25 points):**
- Mobile app design and functionality (15 pts)
- Voice interaction quality (10 pts)

**Innovation & Security (20 points):**
- Creative automation features (10 pts)
- Security and privacy implementation (10 pts)`,
      deadline: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000), // 42 days from now
      prize: 6000,
      creatorId: sponsorUsers[1].id, // OpenAI
    },
    {
      title: 'AI-Powered Content Moderation System',
      description: `Create a comprehensive content moderation platform for social media and forums:

**Moderation Capabilities:**
• Automated detection of harmful content (hate speech, harassment, spam)
• Image and video content analysis
• Real-time comment and post filtering
• Contextual understanding of conversations
• Multi-language support for global platforms

**Key Features:**
• Configurable moderation policies
• Human-in-the-loop workflows for edge cases
• Appeal process automation
• Detailed analytics and reporting
• Integration with major social platforms and forums

**Advanced Requirements:**
- Bias detection and mitigation
- Cultural sensitivity awareness
- Transparency reports for moderation decisions
- A/B testing framework for policy changes
- Real-time performance monitoring`,
      rubric: `**Evaluation Criteria (100 points total):**

**Detection Accuracy (40 points):**
- Harmful content identification (20 pts)
- False positive/negative rates (10 pts)
- Multi-modal content analysis (10 pts)

**Scalability & Performance (25 points):**
- Real-time processing capabilities (15 pts)
- System architecture design (10 pts)

**Ethics & Transparency (20 points):**
- Bias mitigation strategies (10 pts)
- Transparency and explainability (10 pts)

**Integration & Usability (15 points):**
- Platform integration quality (8 pts)
- Moderator interface design (7 pts)`,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      prize: 9000,
      creatorId: sponsorUsers[2].id, // Anthropic
    },
  ];

  const createdChallenges = await Promise.all(
    challenges.map((challenge) =>
      prisma.challenge.create({
        data: challenge,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      })
    )
  );

  console.log('✅ Created challenges');

  // Create some regular users who might participate
  const regularUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alice.dev@example.com' },
      update: {},
      create: {
        email: 'alice.dev@example.com',
        name: 'Alice Chen',
        username: 'alice_chen_dev',
        avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
        bio: 'Full-stack developer passionate about AI and machine learning',
        location: 'Seattle, WA',
        timezone: 'America/Los_Angeles',
        careerScore: 750,
        githubUrl: 'https://github.com/alicechen',
        portfolioUrl: 'https://alicechen.dev',
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob.builder@example.com' },
      update: {},
      create: {
        email: 'bob.builder@example.com',
        name: 'Bob Martinez',
        username: 'bob_ai_builder',
        avatar: 'https://avatars.githubusercontent.com/u/3?v=4',
        bio: 'AI researcher and startup founder',
        location: 'Austin, TX',
        timezone: 'America/Chicago',
        careerScore: 680,
        githubUrl: 'https://github.com/bobmartinez',
        linkedinUrl: 'https://linkedin.com/in/bobmartinez',
      },
    }),
    prisma.user.upsert({
      where: { email: 'carol.code@example.com' },
      update: {},
      create: {
        email: 'carol.code@example.com',
        name: 'Carol Thompson',
        username: 'carol_thompson',
        avatar: 'https://avatars.githubusercontent.com/u/4?v=4',
        bio: 'Data scientist specializing in NLP and computer vision',
        location: 'New York, NY',
        timezone: 'America/New_York',
        careerScore: 820,
        githubUrl: 'https://github.com/carolthompson',
      },
    }),
  ]);

  console.log('✅ Created regular users');

  // Add some participations
  const participations = [
    { challengeId: createdChallenges[0].id, userId: regularUsers[0].id },
    { challengeId: createdChallenges[0].id, userId: regularUsers[1].id },
    { challengeId: createdChallenges[1].id, userId: regularUsers[0].id },
    { challengeId: createdChallenges[1].id, userId: regularUsers[2].id },
    { challengeId: createdChallenges[2].id, userId: regularUsers[1].id },
    { challengeId: createdChallenges[3].id, userId: regularUsers[2].id },
  ];

  await Promise.all(
    participations.map(({ challengeId, userId }) =>
      prisma.challenge.update({
        where: { id: challengeId },
        data: {
          participants: {
            connect: { id: userId },
          },
        },
      })
    )
  );

  console.log('✅ Added challenge participations');

  console.log('🎉 Seed completed successfully!');
  console.log(`Created ${sponsorUsers.length + regularUsers.length} users and ${createdChallenges.length} challenges`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 