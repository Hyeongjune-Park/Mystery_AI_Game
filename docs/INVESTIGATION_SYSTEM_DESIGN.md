# 조사 의뢰 시스템 설계서

## 개요
플레이어가 형사에게 조사를 의뢰하면 일정 턴 후 자동으로 결과가 나오고, 메신저처럼 알림 배지가 표시되는 시스템.

## 1. 데이터 구조

### Session.flags 구조
```typescript
interface SessionFlags {
  node: string;
  flags: string[];
  turnCount: number;                         // 현재 턴 수
  investigationRequests: InvestigationRequest[];  // 조사 요청 목록
  revealedClues: string[];                   // 공개된 단서 목록
  unreadMessages: Record<string, number>;    // NPC별 읽지 않은 메시지 수 { "npc.detective.doil": 1 }
}

interface InvestigationRequest {
  id: string;                    // 고유 ID
  type: 'forensic' | 'cctv' | 'database' | 'interview';
  requestedAt: number;           // 요청한 턴 번호
  completesAt: number;           // 완료될 턴 번호
  clueToReveal: string;          // 공개될 단서 코드
  npcId: string;                 // 결과를 알려줄 NPC ID
  status: 'pending' | 'ready' | 'claimed';
  notificationMessage: string;   // 완료 시 전송할 메시지
}
```

### Message 타입 확장
```typescript
// role 필드에 'system' 추가
// 'player' | 'npc' | 'system'

// 시스템 메시지 예시
{
  role: 'system',
  npcName: '도일 형사',
  content: '지문 분석 결과가 나왔습니다. 와인잔에서 박민서의 지문이 검출되었습니다.',
  payloadJson: {
    type: 'investigation_complete',
    requestId: 'req_001',
    clueRevealed: 'clue.fingerprint.wineglass'
  }
}
```

## 2. 조사 소요 시간 기준

| 조사 타입 | 최소 턴 | 최대 턴 | 예시 |
|---------|--------|--------|------|
| CCTV 조회 | 2 | 3 | 역 CCTV, 건물 CCTV |
| 지문 분석 | 3 | 5 | 와인잔, 옥상 문 |
| 교통카드 내역 | 4 | 6 | 개찰구 기록 |
| 혈액/독극물 검사 | 5 | 8 | 부검 결과 |
| 데이터베이스 조회 | 3 | 5 | 범죄 기록, 처방전 |
| 은행 기록 | 6 | 10 | 영장 필요 |

## 3. 워크플로우

### 플레이어가 조사 의뢰
```
[턴 5] 플레이어 → 형사: "와인잔의 지문을 조사해주세요"
  ↓
[시스템] LLM이 의도 파악 (intent: "request_investigation")
  ↓
[시스템] InvestigationRequest 생성
  - id: "req_fp_001"
  - requestedAt: 5
  - completesAt: 8 (3턴 후)
  - clueToReveal: "clue.fingerprint.wineglass"
  - npcId: "npc.detective.doil"
  ↓
[형사] "알겠습니다. 감식과에 의뢰하겠습니다. 조금 시간이 걸릴 것 같네요."
```

### 조사 완료 및 알림
```
[턴 8] 플레이어가 아무 NPC와 대화 중
  ↓
[시스템] 메시지 컨트롤러에서 턴 체크
  - completesAt <= turnCount인 요청 발견
  ↓
[시스템] 자동 시스템 메시지 생성
  - Message 생성 (role: 'system', npcName: '도일 형사')
  - unreadMessages['npc.detective.doil']++
  ↓
[프론트엔드] 타임라인 폴링으로 감지
  - 도일 형사 아이콘에 빨간 배지 "1" 표시
```

### 플레이어가 알림 확인
```
[플레이어] 도일 형사 클릭
  ↓
[프론트엔드] 타임라인 로드 및 표시
  - 시스템 메시지 렌더링: "지문 분석 결과가 나왔습니다..."
  - unreadMessages['npc.detective.doil'] = 0
  ↓
[시스템] 단서 해제
  - revealedClues에 'clue.fingerprint.wineglass' 추가
  - 수사노트에 자동 추가
```

## 4. clues.json 정의 예시

```json
{
  "code": "clue.fingerprint.wineglass",
  "tier": "physical",
  "type": "evidence",
  "title": "와인잔의 지문",
  "description": "현장에서 발견된 와인잔에서 박민서의 지문이 검출됨.",
  "importance": 0.95,
  "solution_critical": true,
  "autoReveal": false,
  "revealCondition": {
    "mode": "investigation_request",
    "requestTrigger": {
      "type": "keyword_cluster",
      "keywords": ["지문", "조사", "분석", "감식", "와인잔"],
      "minKeywords": 2,
      "npcRequired": "npc.detective.doil"
    },
    "investigation": {
      "type": "forensic",
      "minTurns": 3,
      "maxTurns": 5,
      "notificationMessage": "지문 분석 결과가 나왔습니다. 와인잔에서 박민서의 지문이 검출되었습니다."
    }
  },
  "supports": ["clue.suspect.was_at_scene"],
  "contradicts": ["clue.suspect.alibi_home"]
}
```

## 5. 구현 단계

### Phase 1: 백엔드 기본 구조 ✅ **완료 (2025-01-17)**
1. ✅ SessionFlags 타입 정의 (`apps/api/src/types/investigation.types.ts`)
2. ✅ Message에 'system' role 지원 추가 (sessions.service.ts LogFrom 확장)
3. ✅ MessagesController에 턴 증가 로직 추가 (line 150-152)
4. ✅ 조사 완료 체크 및 자동 메시지 생성 로직 (line 154-187)

### Phase 2: 조사 의뢰 감지 ✅ **완료 (2025-01-17)**
1. ✅ LLM 프롬프트에 조사 의뢰 의도 파악 가이드 추가 (`prompts.ts`)
2. ✅ NPC Reply 스키마에 investigation_request 필드 추가 (`schema.ts`)
3. ✅ InvestigationRequest 생성 및 Session.flags에 저장 (messages.controller.ts line 321-340)

### Phase 3: 프론트엔드 알림 UI ⬜ **대기 중**
1. ⬜ NPC 목록에 unreadMessages 배지 표시
2. ⬜ 타임라인 폴링으로 새 메시지 감지
3. ⬜ 시스템 메시지 특별 렌더링 (다른 스타일)
4. ⬜ NPC 선택 시 unreadMessages 카운트 리셋

### Phase 4: 단서 해제 연동 ✅ **자동 완료**
1. ✅ 시스템 메시지 확인 시 단서 자동 해제 (sessions.addClue 호출)
2. ⬜ 수사노트에 자동 추가 (프론트엔드 작업 필요)
3. ⬜ 단서 연결 제안 (향후 기능)

### Phase 5: 추가 기능 ⬜ **향후 계획**
1. ⬜ 별도 알림 팝업 (선택적)
2. ⬜ 조사 진행 상황 표시
3. ⬜ 조사 의뢰 히스토리

## 6. API 엔드포인트

### 기존 유지
- `POST /sessions/:id/message` - 턴 체크 로직 추가
- `GET /sessions/:id/timeline` - 시스템 메시지 포함

### 신규 추가 (선택적)
- `GET /sessions/:id/unread` - 읽지 않은 메시지 수 조회
- `POST /sessions/:id/mark-read` - 메시지 읽음 처리

## 7. 예시 시나리오

### 시나리오 1: 지문 조사
```
[턴 5] 플레이어 → 형사: "현장의 와인잔, 지문 감식 부탁드립니다"
[턴 5] 형사: "네, 바로 감식과에 보내겠습니다. 결과 나오면 연락드리겠습니다."
[턴 6-7] 플레이어는 다른 NPC와 대화
[턴 8] 시스템: 도일 형사 아이콘에 빨간 배지 "1"
[플레이어] 형사 클릭
[시스템 메시지] "🔬 지문 분석 결과가 나왔습니다. 와인잔에서 박민서의 지문이 검출되었습니다."
[수사노트] "와인잔의 지문 - 박민서" 자동 추가
```

### 시나리오 2: CCTV 조회
```
[턴 10] 플레이어 → 형사: "23시경 역 CCTV 확인 가능한가요?"
[턴 10] 형사: "역 관리실에 요청해보겠습니다. 곧 받을 수 있을 겁니다."
[턴 11-12] 플레이어는 다른 활동
[턴 13] 시스템: 형사 배지 "1"
[플레이어] 확인
[시스템 메시지] "📹 역 CCTV 영상을 입수했습니다. 23시 15분, 박민서가 역 개찰구를 통과하는 모습이 포착되었습니다."
```

### 시나리오 3: 복수 조사 동시 진행
```
[턴 5] 지문 조사 의뢰 (완료: 턴 8)
[턴 7] CCTV 조사 의뢰 (완료: 턴 9)
[턴 8] 형사 배지 "1" (지문 결과)
[턴 9] 형사 배지 "2" (CCTV 결과 추가)
[플레이어] 타임라인에 두 메시지 모두 표시
```

## 8. UI/UX 고려사항

### 알림 배지 디자인
- 위치: NPC 아바타 우측 상단
- 스타일: 빨간 원형 배지, 흰색 숫자
- 애니메이션: 새 메시지 도착 시 펄스 효과

### 시스템 메시지 스타일
- 일반 NPC 메시지와 구분
- 아이콘 추가 (🔬, 📹, 📋 등)
- 배경색 약간 다르게 (예: 연한 파란색)
- "자동 전송됨" 표시

### 사용성
- 배지 클릭 시 해당 NPC 대화창 자동 오픈
- 시스템 메시지는 스크롤 시 자동 강조
- 단서 해제 시 짧은 애니메이션 효과