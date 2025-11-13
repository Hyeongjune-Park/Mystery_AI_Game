# Trigger System Test Script (PowerShell)
# 트리거 시스템 테스트: 증거 발견 → 컷신 트리거

Write-Host "=== Trigger System Test ===" -ForegroundColor Cyan
Write-Host ""

# 1. 세션 생성
Write-Host "1. Creating session..." -ForegroundColor Yellow
$sessionResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:3001/sessions" `
    -ContentType "application/json" `
    -Body '{"caseId": "c001"}'

$sessionId = $sessionResponse.sessionId
Write-Host "Session ID: $sessionId" -ForegroundColor Green
Write-Host ""

# 2. 초기 메시지 전송 (트리거 전)
Write-Host "2. Sending initial message (before clue discovery)..." -ForegroundColor Yellow
$beforeResponse = Invoke-RestMethod -Method Post `
    -Uri "http://localhost:3001/sessions/$sessionId/message" `
    -ContentType "application/json" `
    -Body '{"caseId": "c001", "npcId": "npc.detective.doil", "text": "안녕하세요"}'

Write-Host "Triggered Actions (before): $($beforeResponse.triggeredActions.Count)"
Write-Host ""

# 3. 증거 추가 (bloody_knife 발견)
Write-Host "3. Adding clue: bloody_knife..." -ForegroundColor Yellow
$clueResponse = Invoke-RestMethod -Method Post `
    -Uri "http://localhost:3001/sessions/$sessionId/clues" `
    -ContentType "application/json" `
    -Body '{"clueId": "bloody_knife"}'

Write-Host "Clue added: $($clueResponse.message)" -ForegroundColor Green
Write-Host ""

# 4. 메시지 전송 (트리거 후)
Write-Host "4. Sending message after clue discovery..." -ForegroundColor Yellow
$afterResponse = Invoke-RestMethod -Method Post `
    -Uri "http://localhost:3001/sessions/$sessionId/message" `
    -ContentType "application/json" `
    -Body '{"caseId": "c001", "npcId": "npc.detective.doil", "text": "칼을 발견했습니다"}'

Write-Host "Triggered Actions (after):"
$afterResponse.triggeredActions | ConvertTo-Json -Depth 10
Write-Host ""

# 5. 결과 확인
$actionsCount = $afterResponse.triggeredActions.Count

if ($actionsCount -gt 0) {
    Write-Host "✅ SUCCESS: $actionsCount action(s) triggered!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Action details:"
    foreach ($action in $afterResponse.triggeredActions) {
        Write-Host "  - Type: $($action.type)" -ForegroundColor Cyan
        if ($action.story) {
            Write-Host "    Story: $($action.story)" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "❌ FAIL: No actions triggered" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
