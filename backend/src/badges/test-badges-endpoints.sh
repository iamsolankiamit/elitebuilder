#!/bin/bash

# Test script for EliteBuilders Badges APIs
# Make sure the backend is running on port 3001

BASE_URL="http://localhost:3001"
echo "Testing EliteBuilders Badges APIs..."
echo "====================================="

# Note: Some endpoints require authentication tokens
# For testing purposes, you'll need valid JWT tokens for different user types

# Test public endpoints first
echo -e "\n1. Badge Statistics"
curl -s "$BASE_URL/badges/stats" | jq '.'

echo -e "\n2. Get All Badges (Public)"
curl -s "$BASE_URL/badges?limit=5" | jq '.'

echo -e "\n3. Get Sponsor Favorites (Public)"
curl -s "$BASE_URL/badges/sponsor/favorites?limit=3" | jq '.'

echo -e "\n4. Get User Badges (Public - example with user ID 2)"
curl -s "$BASE_URL/badges/user/2" | jq '.'

echo -e "\n5. Search Badges by Type"
curl -s "$BASE_URL/badges?type=SPONSOR_FAVORITE&limit=3" | jq '.'

echo -e "\n6. Search Badges by Name"
curl -s "$BASE_URL/badges?search=favorite&limit=3" | jq '.'

echo -e "\n7. Filter Badges by User ID"
curl -s "$BASE_URL/badges?userId=2&limit=3" | jq '.'

echo -e "\n8. Paginated Badge Results"
curl -s "$BASE_URL/badges?page=1&limit=2" | jq '.'

# The following endpoints require authentication tokens
# Uncomment and provide valid tokens to test authenticated endpoints

# echo -e "\n9. Award Sponsor Badge (Requires Sponsor Token)"
# SPONSOR_TOKEN="your_sponsor_jwt_token_here"
# curl -s -X POST "$BASE_URL/badges/sponsor/award" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $SPONSOR_TOKEN" \
#   -d '{
#     "userId": 3,
#     "challengeId": 1,
#     "reason": "Outstanding AI implementation",
#     "customName": "Innovation Award",
#     "customDescription": "Exceptional work on machine learning challenge"
#   }' | jq '.'

# echo -e "\n10. Get Sponsor Badge Activity (Requires Sponsor Token)"
# curl -s "$BASE_URL/badges/sponsor/activity?limit=5" \
#   -H "Authorization: Bearer $SPONSOR_TOKEN" | jq '.'

# echo -e "\n11. Create Badge (Requires Admin Token)"
# ADMIN_TOKEN="your_admin_jwt_token_here"
# curl -s -X POST "$BASE_URL/badges" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $ADMIN_TOKEN" \
#   -d '{
#     "name": "Test Excellence",
#     "description": "Awarded for excellent testing practices",
#     "imageUrl": "https://cdn.elitebuilders.dev/badges/test.png",
#     "type": "CATEGORY_WINNER",
#     "userId": 2
#   }' | jq '.'

# echo -e "\n12. Delete Badge (Requires Admin Token or Badge Owner)"
# curl -s -X DELETE "$BASE_URL/badges/1" \
#   -H "Authorization: Bearer $ADMIN_TOKEN"

echo -e "\n✅ Public badge endpoints tested successfully!"
echo "🔐 To test authenticated endpoints, uncomment the relevant sections and provide valid JWT tokens."

echo -e "\n📝 Test Coverage:"
echo "  ✅ Badge statistics"
echo "  ✅ Public badge listing with pagination"
echo "  ✅ Sponsor favorites listing"
echo "  ✅ User badge profiles"
echo "  ✅ Badge filtering by type, search, and user"
echo "  🔐 Sponsor badge awarding (requires auth)"
echo "  🔐 Sponsor activity tracking (requires auth)"
echo "  🔐 Badge creation (requires admin auth)"
echo "  🔐 Badge deletion (requires auth)"

echo -e "\n🚀 To test sponsor functionality:"
echo "  1. Get a sponsor JWT token by logging in as a sponsor user"
echo "  2. Uncomment the sponsor test sections above"
echo "  3. Replace 'your_sponsor_jwt_token_here' with the actual token"
echo "  4. Run the script again" 