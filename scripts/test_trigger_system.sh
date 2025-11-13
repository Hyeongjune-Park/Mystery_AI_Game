#!/bin/bash
# Trigger System Test Script
# 트리거 시스템 테스트: 증거 발견 → 컷신 트리거

echo "=== Trigger System Test ==="
echo ""

# 1. 세션 생성
echo "1. Creating session..."
SESSION_RESPONSE=$(curl -s -X POST http://localhost:3001/sessions \
  -H "Content-Type: application/json" \
  -d '{"caseId": "c001"}')

SESSION_ID=$(echo $SESSION_RESPONSE | jq -r '.sessionId')
echo "Session ID: $SESSION_ID"
echo ""

# 2. 초기 메시지 전송 (트리거 전)
echo "2. Sending initial message (before clue discovery)..."
BEFORE_RESPONSE=$(curl -s -X POST http://localhost:3001/sessions/$SESSION_ID/message \
  -H "Content-Type: application/json" \
  -d '{"caseId": "c001", "npcId": "npc.detective.doil", "text": "안녕하세요"}')

echo "Triggered Actions (before): $(echo $BEFORE_RESPONSE | jq '.triggeredActions')"
echo ""

# 3. 증거 추가 (bloody_knife 발견)
echo "3. Adding clue: bloody_knife..."
CLUE_RESPONSE=$(curl -s -X POST http://localhost:3001/sessions/$SESSION_ID/clues \
  -H "Content-Type: application/json" \
  -d '{"clueId": "bloody_knife"}')

echo "Clue added: $(echo $CLUE_RESPONSE | jq '.message')"
echo ""

# 4. 메시지 전송 (트리거 후)
echo "4. Sending message after clue discovery..."
AFTER_RESPONSE=$(curl -s -X POST http://localhost:3001/sessions/$SESSION_ID/message \
  -H "Content-Type: application/json" \
  -d '{"caseId": "c001", "npcId": "npc.detective.doil", "text": "칼을 발견했습니다"}')

echo "Triggered Actions (after):"
echo $AFTER_RESPONSE | jq '.triggeredActions'
echo ""

# 5. 결과 확인
ACTIONS_COUNT=$(echo $AFTER_RESPONSE | jq '.triggeredActions | length')

if [ "$ACTIONS_COUNT" -gt "0" ]; then
    echo "✅ SUCCESS: $ACTIONS_COUNT action(s) triggered!"
    echo ""
    echo "Action details:"
    echo $AFTER_RESPONSE | jq '.triggeredActions[] | {type, story}'
else
    echo "❌ FAIL: No actions triggered"
fi

echo ""
echo "=== Test Complete ==="
