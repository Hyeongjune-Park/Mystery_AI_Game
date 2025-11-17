# 조사 의뢰 시스템 테스트 가이드

## 백엔드 구현 완료 사항

### 1. 타입 정의 (`apps/api/src/types/investigation.types.ts`)
- `InvestigationType`: 'forensic' | 'cctv' | 'database' | 'interview'
- `InvestigationRequest` 인터페이스
- `SessionFlags` 확장 (turnCount, investigationRequests, unreadMessages)
- `INVESTIGATION_DURATION` 상수

### 2. 세션 서비스 확장 (`apps/api/src/sessions/sessions.service.ts`)
- `incrementTurn()`: 턴 카운터 증가
- `addInvestigationRequest()`: 조사 요청 추가
- `getCompletedInvestigations()`: 완료된 조사 조회
- `updateInvestigationStatus()`: 조사 상태 업데이트
- `incrementUnreadMessages()`: 미확인 메시지 카운트 증가
- `resetUnreadMessages()`: 미확인 메시지 카운트 초기화
- `LogFrom` 타입에 'system' 추가

### 3. LLM 스키마 확장 (`apps/api/src/ai/schema.ts`)
- `NpcReplyV1` 인터페이스에 `investigation_request` 필드 추가
- JSON 스키마에 investigation_request 검증 규칙 추가

### 4. 프롬프트 업데이트 (`apps/api/src/ai/prompts.ts`)
- 조사 의뢰 시스템 가이드라인 추가
- 조사 타입별 소요 시간 안내
- 형사/수사관 NPC만 조사 수락 가능 명시

### 5. 메시지 컨트롤러 통합 (`apps/api/src/messages/messages.controller.ts`)
- 메시지 전송 시 턴 자동 증가 (line 151)
- 완료된 조사 자동 체크 및 시스템 메시지 생성 (line 154-187)
- LLM 응답에서 investigation_request 감지 및 처리 (line 321-340)
- 타임라인 API에 'system' 메시지 타입 지원 (line 435)

## 작동 방식

### 플레이어가 조사 의뢰
```
[턴 5] 플레이어 → 형사: "와인잔의 지문을 조사해주세요"
  ↓
[LLM] investigation_request 필드 반환:
{
  "type": "forensic",
  "clue_to_reveal": "clue.fingerprint.wineglass",
  "description": "와인잔의 지문 감식",
  "duration_turns": 3
}
  ↓
[시스템] InvestigationRequest 생성 및 저장:
- requestedAt: 5
- completesAt: 8 (5 + 3)
- status: "pending"
  ↓
[형사] "알겠습니다. 감식과에 의뢰하겠습니다."
```

### 조사 완료 및 알림
```
[턴 8] 플레이어가 아무 NPC와 대화
  ↓
[시스템] MessagesController에서 자동 체크
- getCompletedInvestigations() 호출
- completesAt <= 8인 요청 발견
  ↓
[시스템] 자동 시스템 메시지 생성
- role: 'system'
- text: "와인잔의 지문 감식 결과가 나왔습니다."
- payloadJson: { type: 'investigation_complete', ... }
  ↓
[시스템] 후처리
- status를 'ready'로 변경
- unreadMessages['npc.detective.doil']++
- addClue('clue.fingerprint.wineglass')
```

## 테스트 방법

### 준비 사항
1. 형사 NPC가 있는 케이스 필요 (예: `npc.detective.doil`)
2. 단서 코드가 `clues.json`에 정의되어 있어야 함

### 테스트 시나리오 1: 지문 조사 의뢰

**Step 1**: 게임 시작 (턴 1)
```bash
POST http://localhost:3001/sessions/:id/message
{
  "caseId": "c001",
  "npcId": "npc.detective.doil",
  "text": "안녕하세요"
}
```

**Step 2**: 지문 조사 의뢰 (턴 2)
```bash
POST http://localhost:3001/sessions/:id/message
{
  "caseId": "c001",
  "npcId": "npc.detective.doil",
  "text": "현장에서 발견된 와인잔의 지문을 조사해주세요"
}
```

**예상 응답**:
- LLM이 `investigation_request` 반환
- 로그: "Investigation request created: ... (forensic, completes at turn 5)"
- NPC 답변: "알겠습니다. 감식과에 의뢰하겠습니다..."

**Step 3**: 다른 NPC와 대화 (턴 3, 4)
```bash
POST http://localhost:3001/sessions/:id/message
{
  "caseId": "c001",
  "npcId": "npc.suspect.minseo",
  "text": "사건 당일 어디 계셨나요?"
}
```

**Step 4**: 조사 완료 턴 도달 (턴 5)
```bash
POST http://localhost:3001/sessions/:id/message
{
  "caseId": "c001",
  "npcId": "npc.suspect.minseo",
  "text": "계속 질문할게요"
}
```

**예상 동작**:
- 로그: "Investigation {id} completed: clue.fingerprint.wineglass"
- 시스템 메시지 생성 (from: 'system')
- unreadMessages 증가

**Step 5**: 타임라인 확인
```bash
GET http://localhost:3001/sessions/:id/timeline?limit=50
```

**예상 응답**:
```json
{
  "sessionId": "...",
  "items": [
    {
      "at": "2025-01-17T...",
      "from": "system",
      "text": "와인잔의 지문 감식 결과가 나왔습니다."
    },
    ...
  ]
}
```

### 테스트 시나리오 2: CCTV 조회 의뢰

```bash
POST http://localhost:3001/sessions/:id/message
{
  "caseId": "c001",
  "npcId": "npc.detective.doil",
  "text": "23시경 역 CCTV를 확인해주실 수 있나요?"
}
```

**예상**:
- type: "cctv"
- duration_turns: 2-3
- completesAt: currentTurn + 2 or 3

### 테스트 시나리오 3: 복수 조사 동시 진행

```
[턴 5] 지문 조사 의뢰 (완료: 턴 8)
[턴 7] CCTV 조회 의뢰 (완료: 턴 9)
[턴 8] → 지문 결과 시스템 메시지
[턴 9] → CCTV 결과 시스템 메시지
```

## 로그 확인 포인트

### 조사 의뢰 생성 시
```
[MessagesController] Investigation request created: {uuid} (forensic, completes at turn 8)
```

### 조사 완료 시
```
[MessagesController] Turn 8 for session {sessionId}
[MessagesController] Investigation {uuid} completed: clue.fingerprint.wineglass
```

### 오류 체크
- LLM이 investigation_request를 반환하지 않으면 → 조사 의뢰 미생성
- 일반 용의자/증인 NPC는 investigation_request 반환 안 함 (프롬프트 규칙)

## 프론트엔드 구현 완료 ✅

### 1. NPC 목록에 미확인 메시지 배지 ✅
**파일**: `apps/web/src/app/play/[caseId]/screens/tabs/NpcsTab.tsx`
- `unreadMessages` prop 추가
- NPC 아바타 우측 상단에 빨간 배지 표시 (line 94-98)
- 숫자 표시 + `animate-pulse` 효과
- 테스트용 더미 데이터: `"npc.detective.doil": 1`

### 2. 타임라인 시스템 메시지 렌더링 ✅
**파일**: `apps/web/src/app/play/[caseId]/TimelinePanel.tsx`
- `TimelineItem` 타입에 'system' 추가 (line 4)
- 시스템 메시지 특별 스타일:
  - 아이콘 표시 (line 56-62)
  - 배경색: `bg-amber-400/5`
  - 좌측 보더: `border-l-2 border-amber-400`
  - 텍스트 색상: `text-amber-500 font-semibold`
- 3초마다 타임라인 폴링 (line 38)

### 3. 상태 관리 통합 ✅
**파일**: `apps/web/src/app/play/[caseId]/screens/GameMain.tsx`
- `unreadMessages` 상태 추가 (line 31-33)
- NpcsTab에 prop 전달 (line 133)

### 4. API 타입 확장 ✅
**파일**: `apps/web/src/lib/api.ts`
- `TimelineItem` 타입 정의 (line 30-34)
- `TimelineResponse` 타입 정의 (line 36-39)
- `fetchTimeline` 반환 타입 명시 (line 41)

## 향후 개선 사항

### 백엔드 API 추가 (선택적)
현재는 프론트엔드에서 타임라인을 폴링하여 시스템 메시지를 감지하지만, 백엔드 API를 추가하면 더 효율적입니다:

```typescript
// GET /sessions/:id/unread
{
  "unreadMessages": {
    "npc.detective.doil": 2,
    "npc.suspect.minseo": 1
  }
}

// POST /sessions/:id/npcs/:npcId/mark-read
// 응답: { "success": true }
```

### 실시간 업데이트 개선
- WebSocket 또는 Server-Sent Events (SSE) 사용
- 폴링 간격 조정 (현재 3초)
- 백그라운드 탭에서 폴링 중단

### UX 개선
- 배지 클릭 시 대화 탭으로 자동 이동 + NPC 선택
- 시스템 메시지 읽음 처리 후 배지 카운트 감소
- 새 시스템 메시지 도착 시 브라우저 알림 (선택적)

## API 엔드포인트 정리

### 기존
- `POST /sessions/:id/message` - 조사 의뢰 감지 및 완료 체크 추가됨
- `GET /sessions/:id/timeline` - 'system' 메시지 포함

### 향후 추가 고려
- `GET /sessions/:id/unread` - 미확인 메시지 수 조회 (선택적)
- `POST /sessions/:id/npcs/:npcId/mark-read` - 읽음 처리 (선택적)

현재는 프론트엔드에서 직접 timeline API를 폴링하여 시스템 메시지 감지 가능.