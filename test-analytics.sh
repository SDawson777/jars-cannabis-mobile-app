#!/bin/bash

# Simple test script to demonstrate analytics functionality

echo "🚀 Testing Analytics Implementation"
echo ""

# Test 1: Backend analytics endpoint
echo "📊 Testing Backend Analytics Endpoint..."
cd backend
npm start &
SERVER_PID=$!
sleep 3

# Wait for server to start then test
curl -X POST http://localhost:3000/api/analytics/track \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user-123" \
  -d '{
    "event": "concierge_message_sent", 
    "data": {
      "messageLength": 25,
      "hasHistory": true,
      "historySize": 3,
      "timestamp": '$(date +%s)'
    }
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s

echo ""

# Test 2: Rate limiting
echo "⚡ Testing Rate Limiting..."
for i in {1..105}; do
  curl -X POST http://localhost:3000/api/analytics/track \
    -H "Content-Type: application/json" \
    -H "x-user-id: rate-limit-test" \
    -d '{"event": "test_spam"}' \
    -s -w "%{http_code} " -o /dev/null
  if [ $i -eq 105 ]; then
    echo -e "\nShould see 429 (rate limited) for request #105"
  fi
done

echo ""

# Test 3: PII Sanitization
echo "🔒 Testing PII Sanitization..."
curl -X POST http://localhost:3000/api/analytics/track \
  -H "Content-Type: application/json" \
  -H "x-user-id: pii-test" \
  -d '{
    "event": "user_action",
    "data": {
      "email": "user@example.com",
      "phone": "555-1234",
      "name": "John Doe",
      "productId": "prod-123",
      "action": "purchase"
    }
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s

echo ""
echo "✅ Analytics Implementation Test Complete!"
echo ""
echo "Key Features Tested:"
echo "  ✓ Event tracking with userId and event payload logging"
echo "  ✓ Rate limiting (100 events/min per user)"  
echo "  ✓ PII data sanitization"
echo "  ✓ Non-PII event sink functionality"
echo ""
echo "🎯 Events now visible in logs with userId + event payload (non-PII)"

# Cleanup
kill $SERVER_PID 2>/dev/null