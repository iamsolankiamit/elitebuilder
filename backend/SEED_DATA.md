# Seed Data Documentation

This document describes the seed data created for the EliteBuilders platform and how to manage it.

## Overview

The seed script creates realistic sample data including:
- **7 Users**: 4 sponsor/company accounts and 3 regular developer accounts
- **6 Challenges**: Diverse AI-focused challenges from different sponsors
- **Challenge Participations**: Sample participations to show engagement

## Seeded Users

### Sponsor/Company Accounts
1. **EliteBuilders Admin** (`admin@elitebuilders.com`)
   - Platform administrator
   - Career Score: 1000
   - Admin & Sponsor privileges

2. **OpenAI** (`openai@sponsor.com`)
   - AI research company
   - Career Score: 950
   - Sponsor privileges

3. **Anthropic** (`anthropic@sponsor.com`)
   - AI safety research company
   - Career Score: 920
   - Sponsor privileges

4. **Google AI** (`google@sponsor.com`)
   - Google AI research and products
   - Career Score: 980
   - Sponsor privileges

### Developer Accounts
1. **Alice Chen** (`alice.dev@example.com`)
   - Full-stack developer
   - Career Score: 750
   - Participating in multiple challenges

2. **Bob Martinez** (`bob.builder@example.com`)
   - AI researcher and startup founder
   - Career Score: 680
   - Active participant

3. **Carol Thompson** (`carol.code@example.com`)
   - Data scientist specializing in NLP
   - Career Score: 820
   - Challenge participant

## Seeded Challenges

1. **AI-Powered Customer Support Chatbot** (OpenAI)
   - Deadline: 14 days from seed date
   - Prize: $5,000
   - Focus: NLP, customer service automation

2. **Smart Code Review Assistant** (Anthropic)
   - Deadline: 21 days from seed date
   - Prize: $7,500
   - Focus: Code analysis, developer tools

3. **Personal AI Financial Advisor** (Google AI)
   - Deadline: 28 days from seed date
   - Prize: $10,000
   - Focus: FinTech, personal finance

4. **AI-Enhanced Learning Platform** (EliteBuilders Admin)
   - Deadline: 35 days from seed date
   - Prize: $8,000
   - Focus: EdTech, adaptive learning

5. **Smart Home Automation Assistant** (OpenAI)
   - Deadline: 42 days from seed date
   - Prize: $6,000
   - Focus: IoT, home automation

6. **AI-Powered Content Moderation System** (Anthropic)
   - Deadline: 30 days from seed date
   - Prize: $9,000
   - Focus: Content safety, moderation

## Seed Scripts

### Run Seed
```bash
npm run db:seed
```
Adds seed data to the existing database.

### Reset Database
```bash
npm run db:reset
```
Completely resets the database (removes all data and re-runs migrations).

### Reset and Seed
```bash
npm run db:reset-seed
```
Resets the database and then adds all seed data.

## Challenge Features

Each challenge includes:
- **Detailed Description**: Clear requirements and expectations
- **Technical Stack**: Suggested technologies and frameworks
- **Evaluation Rubric**: Detailed scoring criteria (100 points total)
- **Dataset Links**: Reference datasets for building solutions
- **Realistic Deadlines**: Various timeframes from 2-6 weeks
- **Substantial Prizes**: $5,000 - $10,000 range

## Participation Data

The seed creates realistic participation patterns:
- Multiple users participating in the same challenges
- Varying participation levels across different challenges
- No submissions yet (to allow for fresh testing)

## Usage Tips

1. **Development**: Use `npm run db:reset-seed` when you want a clean slate
2. **Testing**: The seeded data provides realistic test scenarios
3. **Demo**: Great for showcasing the platform with real-looking content
4. **Customization**: Modify `prisma/seed.ts` to adjust the data for your needs

## Data Quality

All seeded data follows these principles:
- **Realistic**: Based on actual AI/tech industry challenges
- **Diverse**: Different types of AI applications and technologies
- **Professional**: High-quality descriptions and requirements
- **Engaging**: Interesting challenges that developers would actually want to solve
- **Complete**: All required fields populated with meaningful data 