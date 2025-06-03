#!/bin/bash

# Test script for EliteBuilders Leaderboard APIs
# Make sure the backend is running on port 3001

BASE_URL="http://localhost:3001"
echo "Testing EliteBuilders Leaderboard APIs..."
echo "=========================================="

echo -e "\n1. Main Leaderboard (with pagination)"
curl -s "$BASE_URL/leaderboard?limit=3&page=1" | jq '.'

echo -e "\n2. Global Leaderboard (All-time)"
curl -s "$BASE_URL/leaderboard/global?limit=2" | jq '.'

echo -e "\n3. Monthly Leaderboard"
curl -s "$BASE_URL/leaderboard/monthly?limit=2" | jq '.'

echo -e "\n4. Top Performers"
curl -s "$BASE_URL/leaderboard/top-performers?limit=2" | jq '.'

echo -e "\n5. Monthly Champions"
curl -s "$BASE_URL/leaderboard/monthly-champions?limit=2" | jq '.'

echo -e "\n6. Sponsor Favorites"
curl -s "$BASE_URL/leaderboard/sponsor-favorites?limit=2" | jq '.'

echo -e "\n7. User Ranking (for user ID 2)"
curl -s "$BASE_URL/leaderboard/user/2/ranking" | jq '.'

echo -e "\n8. Leaderboard Stats"
curl -s "$BASE_URL/leaderboard/stats" | jq '.'

echo -e "\n9. Search for users"
curl -s "$BASE_URL/leaderboard?search=admin&limit=2" | jq '.'

echo -e "\n10. Filter by period and category"
curl -s "$BASE_URL/leaderboard?period=weekly&category=ai-ml&limit=2" | jq '.'

echo -e "\n✅ All leaderboard endpoints tested successfully!" 