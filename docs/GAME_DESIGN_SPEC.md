# 추리 게임 완전 정의서 (Game Design Specification)

## 📋 문서 목적
이 문서는 AI 기반 대화형 추리 게임의 **완전한 게임 루프, 규칙, 승패 조건, 진행 단계**를 정의합니다.
코드 구현, 케이스 제작, LLM 프롬프트 설계의 기준이 됩니다.

---

## 🎯 게임 목표 (Win Condition)

플레이어는 **제한된 시간/행동 내에 사건의 진상을 밝혀야** 합니다.

### 승리 조건 (3가지 중 택 1 또는 조합)

1. **범인 지목형 (Accusation Mode)**
   - 정확한 범인을 지목 + 핵심 증거 N개 이상 제시
   - 예: "박민서가 범인입니다. 증거: [CCTV 시간, 지문, 동기]"

2. **진실 도출형 (Truth Revelation Mode)**
   - 사건의 핵심 진실을 밝힘 (예: 자살이 아닌 타살, 공범 존재 등)
   - 엔딩 조건: `flags`에 `truth_revealed` 포함 + 핵심 단서 80% 이상 수집

3. **복합형 (Multi-tier Ending)**
   - Normal Ending: 범인만 맞춤 (핵심 단서 50%)
   - True Ending: 범인 + 배후 + 동기 모두 밝힘 (핵심 단서 90%)
   - Bad Ending: 시간 초과 또는 오판

---

## ⏱️ 게임 진행 구조

### 1. Soft Phase 시스템 (유연한 단계 전환)

**핵심 철학**: 플레이어가 페이즈 전환을 명시적으로 느끼지 못하게 하되, 게임 진행에 따라 **새로운 기능을 점진적으로 해금**하는 방식

게임은 내부적으로 4단계로 진행되지만, UI에서는 "Phase 2" 같은 명칭을 노출하지 않습니다.
대신 "사건 진행도 35%" 같은 자연스러운 표현을 사용합니다.

#### Stage 1: Introduction (사건 소개)
- **활성 기능**:
  - NPC 대화
  - 기본 현장 조사
- **해금 조건**:
  - 조력자 NPC(경찰/탐정 등) 1명 이상과 대화
  - 또는 3턴 경과
- **LLM 행동**:
  - 사건 배경 설명
  - 기본 의문점 제시
  - 소소한 단서(small clues) 자연스럽게 제공

#### Stage 2: Investigation (본격 수사)
- **활성 기능**:
  - Stage 1의 모든 기능 유지
  - **추가**: 추리 노트에 "단서 연결" 버튼 활성화
  - **추가**: 물리적 증거 상세 조사 가능
- **해금 조건**:
  - 핵심 단서(importance >= 0.7) 3개 이상 수집
  - 또는 특정 모순점 발견 (`flags: ["contradiction_found"]`)
- **UI 알림**:
  - "새로운 단서 연결 기능이 해금되었습니다"
  - "이제 증거를 종합하여 추리할 수 있습니다"
- **LLM 행동**:
  - NPC가 단서 제공 (지식 범위 엄수)
  - 거짓말 가능 (설정된 NPC에 한함)
  - 플레이어 질문 방향/키워드에 따라 단서 노출

#### Stage 3: Deduction (추리 심화)
- **활성 기능**:
  - Stage 1, 2의 모든 기능 유지 (추가 단서 수집 가능!)
  - **추가**: "가설 수립" 기능 (추리 노트에서 범인 후보 선택 가능)
  - **추가**: NPC에게 "모순 추궁" 가능 (증거 제시 + 질문)
- **해금 조건**:
  - 단서 수집률 60% 이상
  - 또는 플레이어가 추리 노트에서 "추리 시작" 버튼 클릭
- **UI 표현**:
  - "단서가 충분히 모였습니다. 추리를 시작하시겠습니까?" (선택지)
  - 아니오 선택 시 계속 수사 가능
- **LLM 행동**:
  - 단서 간 모순 지적 허용
  - "이 부분은 어떻게 설명하시겠습니까?" 반박 가능
  - 새로운 단서는 제한적으로 제공 (플레이어가 명시적으로 요청 시에만)

#### Stage 4: Accusation (최종 결론)
- **활성 기능**:
  - 모든 이전 기능 유지
  - **추가**: "범인 지목 및 추리 제출" UI 활성화
- **진입 조건**:
  - 플레이어가 "결론 제출" 버튼 클릭
- **제한**:
  - 제출은 1회만 가능 (오판 시 Bad Ending)
  - 단, 재도전(처음부터 다시 시작)은 허용
- **LLM 행동**:
  - 플레이어의 추리를 평가
  - 증거의 타당성 검증
  - 승패 판정 및 엔딩 분기

**중요**: 페이즈 전환 시 "이전 단계의 기능을 제거하지 않음". 언제든 추가 단서 수집 가능.

---

### 2. 턴 제한 시스템 (행동 포인트 대체)

**결정**: 행동 포인트(AP) 시스템은 **구현하지 않음**. 대신 **턴 수 제한**으로 대체.

- **턴 카운트**: 플레이어의 메시지 전송 1회 = 1턴
- **제한**:
  - Easy 모드: 무제한
  - Normal 모드: 50턴
  - Hard 모드: 30턴
- **UI 표시**: "남은 질문 기회: 42회"
- **초과 시**: Bad Ending (시간 초과)

**구현 방식**:
```json
"session": {
  "flags": {
    "current_stage": "investigation",
    "turn_count": 12,
    "max_turns": 50
  }
}
```

---

## 🧩 단서 시스템 (Clue System)

### 단서 2-Tier 분류

#### Tier 1: 물리적 증거 (Physical Evidence) - 명시적 제공
자동으로 플레이어에게 제공되는 증거. UI에 명확히 표시됨.

```json
{
  "code": "clue.fingerprint.wineglass",
  "tier": "physical",
  "type": "evidence",
  "title": "와인잔의 지문",
  "description": "피해자의 와인잔에서 발견된 불완전한 지문. 부분적으로만 일치하여 신원 확인 불가.",
  "importance": 0.9,
  "solution_critical": true,
  "autoReveal": true,  // 범죄 현장 조사 시 자동 노출
  "uiPresentation": {
    "sceneImage": "crime_scene_desk.png",
    "hotspot": {"x": 320, "y": 180, "radius": 30},
    "tooltip": "누군가의 지문이 묻은 와인잔",
    "clickAction": "add_to_evidence_list"
  },
  "contradicts": ["clue.alibi.suspect1"],
  "supports": ["clue.motive.jealousy"]
}
```

**UI 동작**:
- 범죄 현장 이미지 위에 핫스팟 표시
- 마우스 호버 → 툴팁 "누군가의 지문이 묻은 와인잔"
- 클릭 → 자동으로 증거 목록에 추가 + "와인잔의 지문을 발견했습니다" 알림

#### Tier 2: 대화 단서 (Conversational Clues) - 플레이어 기록 필요
NPC 대화 중 얻은 정보. **플레이어가 직접 추리 노트에 작성**해야 함.

```json
{
  "code": "clue.testimony.neighbor_noise",
  "tier": "conversational",
  "type": "testimony",
  "title": "이웃 증언: 23시 소음",
  "description": "이웃이 23시경 큰 소리를 들었다고 증언",
  "importance": 0.6,
  "solution_critical": false,
  "autoReveal": false,
  "revealCondition": {
    "mode": "conversational",
    "triggers": [
      {
        "type": "keyword_cluster",
        "keywords": ["소리", "소음", "들렸나요", "23시"],
        "minKeywords": 2,
        "contextRequired": "time_inquiry"
      },
      {
        "type": "indirect_approach",
        "keywords": ["주변 사람들", "이웃", "누가 봤나요"],
        "npcTrait": "gossipy"
      }
    ],
    "npcKnowledge": ["npc.neighbor"]
  },
  "supports": ["clue.timeline.23pm"]
}
```

**플레이어 경험**:
```
NPC: "그날 밤 11시쯤 큰 소리가 들렸어요."
  ↓
플레이어가 추리 노트에 직접 입력:
"이웃 증언: 23시에 소음 들음"
  ↓ (선택적 - 추후 개선)
시스템이 관련 단서 제안:
"이 내용이 [clue.timeline.23pm]과 관련 있을 수 있습니다"
```

#### Small Clues vs Critical Clues

**Small Clues** (배경 정보):
- NPC가 자연스럽게 대화 중 제공
- 특별한 키워드 필요 없음
- 예: "그날 비가 왔어요", "피해자는 채식주의자였어요"
- 단독으로는 의미 없지만 다른 단서와 결합 시 중요

```json
{
  "code": "clue.small.weather",
  "tier": "small",
  "importance": 0.2,
  "autoReveal": true,
  "content": "사건 당일 밤 비가 왔음",
  "linkedTo": ["clue.footprint.muddy"]  // 진흙 발자국과 연결
}
```

**Critical Clues** (핵심 증거):
- 특정 질문/키워드/증거 제시 필요
- 예: "범행 도구", "알리바이 모순", "동기"
- 사건 해결에 필수

```json
{
  "code": "clue.critical.murder_weapon",
  "tier": "critical",
  "importance": 1.0,
  "solution_critical": true,
  "autoReveal": false,
  "revealCondition": {
    "mode": "conversational",
    "triggers": [
      {
        "type": "keyword_cluster",
        "keywords": ["범행 도구", "무기", "weapon", "사용했나"],
        "minKeywords": 2
      },
      {
        "type": "evidence_based",
        "requiredClues": ["clue.wound.pattern"],
        "playerMustMention": ["상처", "패턴"]
      }
    ]
  }
}
```

### 단서 공개 메커니즘: 대화 흐름 기반

#### 복합 트리거 시스템
LLM이 다음 조건들을 종합 판단하여 단서 공개 여부 결정:

1. **키워드 클러스터 매칭**
```json
{
  "type": "keyword_cluster",
  "keywords": ["관계", "사이", "친밀", "특별한"],
  "minKeywords": 2,
  "contextRequired": "relationship_inquiry"
}
```

2. **압박 심문 (Pressure Interrogation)**
```json
{
  "type": "pressure_interrogation",
  "indicators": ["반복 질문", "강한 어조", "증거 제시"],
  "npcState": "defensive",
  "minTurns": 3  // 해당 주제로 3턴 이상 대화
}
```

3. **간접 접근 (Indirect Approach)**
```json
{
  "type": "indirect_approach",
  "keywords": ["주변 사람들", "친구들", "소문"],
  "npcTrait": "gossipy"  // 수다스러운 성격만
}
```

4. **증거 기반 (Evidence-based)**
```json
{
  "type": "evidence_based",
  "requiredClues": ["clue.cctv.station"],
  "playerMustMention": ["CCTV", "23시", "역"]
}
```

#### LLM 프롬프트 예시
```json
{
  "available_clues_this_turn": [
    {
      "code": "clue.secret.affair",
      "reveal_reason": "keyword_cluster_matched",
      "matched_keywords": ["관계", "친밀"],
      "instruction": "플레이어가 두 사람의 관계에 대해 집요하게 물어보고 있습니다.
                      NPC는 망설이다가 '사실... 두 사람이 사귀고 있었다는 소문이 있어요'라고 말합니다."
    }
  ]
}
```

### 단서 수집 추적

#### 자동 추적 (물리적 증거)
```typescript
{
  "autoDiscoveredClues": [
    {
      "code": "clue.fingerprint.wineglass",
      "discoveredAt": "2025-01-15T10:23:00Z",
      "source": "crime_scene_investigation",
      "autoAdded": true
    }
  ]
}
```

#### 수동 기록 (대화 단서)
플레이어가 추리 노트에 직접 작성:
```typescript
{
  "playerNotes": [
    {
      "id": "note-001",
      "content": "용의자 A: 11시에 소리 들음",
      "linkedClue": "clue.testimony.neighbor_noise",  // 시스템이 자동 연결 제안
      "createdAt": "2025-01-15T10:25:00Z"
    }
  ]
}
```

#### 단서 연결 추적
```typescript
{
  "clueConnections": [
    {
      "from": "clue.fingerprint.wineglass",
      "to": "clue.alibi.suspect1",
      "relation": "contradicts",
      "playerNoted": true,  // 플레이어가 추리 노트에서 명시적으로 연결
      "confidence": 0.9     // 플레이어의 확신도 (UI에서 별점 등으로 표시)
    }
  ]
}
```

---

## 🎭 NPC 행동 규칙

### NPC 정보 구조 (확장)

```json
{
  "id": "npc.suspect.minseo",
  "displayName": "박민서",
  "role": "용의자",
  "personality": {
    "traits": ["defensive", "anxious", "detail-oriented"],
    "speechPattern": "formal_polite"
  },
  "knowledge": {
    "knows": ["clue.alibi.own", "clue.timeline.dinner"],
    "ignores": ["clue.murder.weapon"],
    "smallClues": [
      "clue.small.weather",
      "clue.small.victim_habit"
    ]  // 자연스럽게 대화 중 제공
  },
  "lies": [
    {
      "id": "lie.alibi_home",
      "content": "23시에 집에 있었어요",
      "truth": "실제로는 23시에 피해자 집 근처에 있었음",
      "contradictedBy": ["clue.cctv.station", "clue.witness.neighbor"],
      "revealWhen": {
        "type": "evidence_confrontation",
        "requiredClues": ["clue.cctv.station"],
        "playerMustMention": ["CCTV", "23시", "역"]
      },
      "afterExposed": {
        "newBehavior": "defensive_angry",
        "revealsClues": ["clue.real_location.victim_house"],
        "newDialogue": "...알았어요. 그때 피해자 집 근처에 있었던 건 사실이에요. 하지만 안에 들어가진 않았어요!",
        "emotionalState": "angry"
      }
    },
    {
      "id": "lie.relationship",
      "content": "피해자와 별로 친하지 않았어요",
      "truth": "실제로는 연인 관계였고 최근 결별",
      "contradictedBy": ["clue.sns.photos", "clue.witness.friend"],
      "revealWhen": {
        "type": "evidence_confrontation",
        "requiredClues": ["clue.sns.photos"]
      },
      "afterExposed": {
        "revealsClues": ["clue.motive.breakup", "clue.insurance.beneficiary"],
        "newDialogue": "...우리 사귀고 있었어요. 근데 헤어졌다고요. 그게 뭐 어때서요?!",
        "emotionalState": "breakdown"
      }
    }
  ],
  "stateChanges": [
    {
      "trigger": "flags.includes('alibi_broken')",
      "newBehavior": "cooperative",
      "newKnowledge": ["clue.real_alibi"]
    },
    {
      "trigger": "flags.includes('all_lies_exposed')",
      "newBehavior": "resigned",
      "newDialogue": "...이제 숨길 게 없네요. 제가 전부 말씀드릴게요.",
      "revealsClues": ["clue.confession.partial"]
    }
  ]
}
```

### 거짓말 시스템: "Lie Graph"

#### 거짓말 적발 → 실토 메커니즘

**플레이 흐름 예시**:
```
1. 초기 대화
플레이어: "23시에 어디 계셨나요?"
NPC: "집에 있었어요." (lie.alibi_home 발동)

2. 증거 수집
플레이어가 CCTV 단서 획득 (clue.cctv.station)

3. 증거 제시
플레이어: "CCTV를 보니 23시 15분에 역에 계셨던데요?"
시스템: lie.alibi_home.revealWhen 조건 체크
  - requiredClues: ✅ clue.cctv.station 보유
  - playerMustMention: ✅ "CCTV", "23시" 키워드 언급

4. 거짓말 들통 + 새 정보 실토
NPC 태도: calm → defensive_angry
NPC: "...알았어요. 그때 피해자 집 근처에 있었던 건 사실이에요. 하지만 안에 들어가진 않았어요!"
시스템: clue.real_location.victim_house 자동 공개

5. 추가 거짓말 발견
플레이어: (SNS 사진 발견 후) "피해자와 사귀고 계셨죠?"
NPC: (lie.relationship 들통)
"...우리 사귀고 있었어요. 근데 헤어졌다고요."
시스템: clue.motive.breakup, clue.insurance.beneficiary 공개
```

**중요**: 거짓말은 반드시 **명확한 증거**로만 반박 가능. "거짓말하는 것 같아요" 같은 심증으로는 불가.

### NPC 역할별 특성

#### 1. 조력자 NPC (Helper) - 힌트 제공

```json
{
  "id": "npc.detective.doil",
  "role": "helper",
  "personality": {
    "traits": ["logical", "patient", "observant"],
    "speechPattern": "professional"
  },
  "hintBehavior": {
    "triggers": [
      {
        "condition": "no_progress",
        "check": {
          "minTurns": 10,
          "clueCoverage": "<30%",
          "criticalCluesMissing": ["clue.murder_weapon", "clue.timeline"]
        },
        "hintType": "direction",
        "dialogue": "혹시 범행 도구에 대해 생각해보셨나요? 현장을 다시 살펴보시면 좋을 것 같은데요."
      },
      {
        "condition": "contradiction_missed",
        "check": {
          "playerHasClues": ["clue.alibi.suspect1", "clue.cctv.station"],
          "notConnected": true,
          "turns_since_acquired": ">5"
        },
        "hintType": "connection",
        "dialogue": "용의자의 알리바이와 CCTV 영상... 뭔가 이상하지 않나요?"
      },
      {
        "condition": "lie_not_exposed",
        "check": {
          "npcHasActiveLie": "npc.suspect.minseo",
          "playerHasCounterEvidence": true,
          "notConfronted": true,
          "turns_since_evidence": ">3"
        },
        "hintType": "interrogation",
        "dialogue": "그 용의자 말이 수상한데, 증거를 제시하며 다시 물어보시는 건 어떨까요?"
      }
    ],
    "hintCooldown": 5,  // 힌트 제공 후 5턴 동안 다음 힌트 안 줌
    "maxHintsPerGame": 3
  }
}
```

**힌트 제공 방식**:
- 자연스러운 대화 중 제공 (명시적 "힌트 버튼" 없음)
- 플레이어가 조력자 NPC와 대화할 때 자동 트리거
- 예: "탐정님, 진전이 없네요..." → "혹시 XX를 조사해보셨나요?"

#### 2. 용의자 NPC (Suspect) - 거짓말 가능

```json
{
  "id": "npc.suspect.minseo",
  "role": "suspect",
  "deception": {
    "allowed": true,
    "maxLies": 2,
    "currentLies": ["lie.alibi_home", "lie.relationship"]
  }
}
```

#### 3. 목격자 NPC (Witness) - 수다스러운 성격

```json
{
  "id": "npc.witness.neighbor",
  "role": "witness",
  "personality": {
    "traits": ["gossipy", "talkative", "observant"]
  },
  "knowledge": {
    "smallClues": ["clue.small.noise", "clue.small.visitor"],
    "revealsEasily": true  // 질문하면 쉽게 정보 제공
  }
}
```

### NPC 대화 규칙

1. **지식 범위 엄수 (Knowledge Boundary)**
   - LLM은 NPC의 `knowledge.knows` + `knowledge.smallClues`에 있는 정보만 제공
   - `knowledge.ignores`에 있는 단서는 절대 언급 불가
   - 모르는 질문: "그 부분은 잘 모르겠어요"

2. **거짓말 메커니즘 (Deception System)**
   - `lies` 배열에 정의된 거짓말만 사용
   - 거짓말은 특정 증거로만 반박 가능 (`contradictedBy`)
   - 들통나면 `afterExposed.revealsClues` 자동 공개
   - 태도 변화: `emotionalState` 반영 (UI에서 표정/어조 변화)

3. **감정 상태 반영 (Emotional States)**
   - 초기: calm/neutral
   - 증거 제시 후: defensive/nervous
   - 거짓말 들통: angry/desperate
   - 모든 거짓말 들통: resigned/cooperative
   - LLM이 `tone` 필드로 표현

4. **정보 제공 조건부성 (Conditional Information)**
   - 신뢰 관계 (`flags: ["trust_built"]`): 추가 정보 제공
   - 적대적 심문 (`flags: ["hostile_approach"]`): 정보 차단
   - 압박 심문 (3턴 이상 같은 주제): 실수로 정보 누설 가능

5. **Small Clues 자연 제공**
   - NPC가 대화 중 자연스럽게 배경 정보 제공
   - 예: "그날 비가 왔었죠", "피해자는 술을 안 마셨는데..."
   - 플레이어가 알아서 중요성 판단해야 함

---

## 🔄 게임 진행 흐름도 (Flowchart)

```
게임 시작
   ↓
[Stage 1: Introduction]
   기능: NPC 대화, 현장 조사
   ↓ (조건: 조력자 NPC 대화 OR 3턴)

[Stage 2: Investigation] ← 이전 기능 유지!
   기능: NPC 대화, 현장 조사, 단서 연결 (추가)
   ├→ NPC 대화 (단서 수집)
   │  ├─ Small Clues 자연 획득
   │  ├─ Critical Clues 키워드/증거 기반 획득
   │  └─ 거짓말 발견 → 증거 제시 → 실토
   ├→ 물리적 증거 조사 (이미지 핫스팟)
   ├→ 조력자 NPC 힌트 (자동 트리거)
   └→ 턴 수 소진 체크
   ↓ (조건: 단서 수집률 60% OR "추리 시작" 클릭)

[Stage 3: Deduction] ← 이전 기능 유지! (추가 수사 가능)
   기능: 모든 Stage 2 기능 + 가설 수립, 모순 추궁 (추가)
   ├→ 추리 노트에서 단서 연결
   ├→ 범인 후보 선택
   ├→ 추가 NPC 심문 가능 (증거 제시)
   └→ "결론 제출" 버튼 활성화
   ↓ (조건: 플레이어 "결론 제출" 클릭)

[Stage 4: Accusation]
   기능: 최종 추리 제출
   ├→ 범인 지목 (1명 선택)
   ├→ 핵심 증거 제시 (최소 3개)
   ├→ 추리 내용 작성 (동기/방법/시간)
   ↓

[판정 시스템]
   ├→ True Ending: 범인 ✓ + 동기/배후 ✓ + 단서 90%
   ├→ Normal Ending: 범인 ✓ + 단서 60%
   ├→ Bad Ending: 범인 ✗
   └→ Timeout Ending: 턴 수 초과

[재도전]
   처음부터 다시 시작 (세이브 포인트 없음)
```

**핵심 특징**:
- Stage 전환 시 이전 기능 제거 안 함 → 언제든 추가 수사 가능
- UI에서 "Stage 2" 같은 명칭 노출 안 함 → "사건 진행도 45%" 표시
- 플레이어가 자율적으로 진행 속도 조절

---

## 🏆 승패 판정 로직

### 최종 결론 제출 UI

#### 제출 방식: 구조화된 양식 (Structured Form)

플레이어가 "결론 제출" 버튼을 클릭하면 전용 UI가 표시됩니다.

**UI 구성**:
```
┌─────────────────────────────────────────────┐
│ 최종 추리 제출                               │
├─────────────────────────────────────────────┤
│                                             │
│ 1. 범인 지목 (필수) *                       │
│   [드롭다운] 선택하세요                      │
│   ○ 박민서 (용의자)                         │
│   ○ 김도일 (목격자)                         │
│   ○ 이수진 (피해자 친구)                    │
│   ○ 범인 없음 (자살/사고)                   │
│                                             │
│ 2. 핵심 증거 선택 (최소 3개) *              │
│   ☑ 와인잔의 지문                           │
│   ☑ CCTV 영상 (23:15 역 출현)              │
│   ☑ 보험금 수익자 서류                      │
│   ☐ 이웃 증언 (소음)                        │
│   ☐ SNS 사진 (연인 관계)                   │
│                                             │
│ 3. 범행 동기 (선택)                         │
│   [텍스트 입력]                             │
│   예: 재산 상속 다툼 및 보험금 목적          │
│                                             │
│ 4. 범행 방법 (선택)                         │
│   [텍스트 입력]                             │
│   예: 수면제를 탄 와인을 제공한 후 추락 위장  │
│                                             │
│ 5. 범행 시간 (선택)                         │
│   [시간 입력] 23:40                         │
│                                             │
│ 6. 추가 정보 (선택)                         │
│   ☐ 공범 존재                               │
│   ☐ 배후 인물 발견                          │
│                                             │
│ [제출하기]  [다시 확인]                     │
└─────────────────────────────────────────────┘
```

**입력 검증**:
- 범인 지목: 필수 (선택 안 하면 제출 불가)
- 핵심 증거: 최소 3개 이상 체크 필요
- 나머지 필드: 선택사항 (True Ending 조건에 영향)

#### 제출 데이터 구조

```typescript
interface FinalAccusation {
  culprit: string;  // npc.suspect.minseo
  evidence: string[];  // [clue.fingerprint, clue.cctv, clue.insurance]
  motive?: string;  // 플레이어가 작성한 동기
  method?: string;  // 플레이어가 작성한 방법
  timeOfCrime?: string;  // "23:40"
  additionalFindings?: {
    hasAccomplice?: boolean;
    mastermindFound?: boolean;
    mastermindId?: string;  // npc.xxx
  };
  submittedAt: string;  // ISO timestamp
}
```

#### API 엔드포인트

```
POST /sessions/:id/accuse
Body: FinalAccusation
Response: {
  result: "true_ending" | "normal_ending" | "bad_ending",
  correctCulprit: boolean,
  evidenceScore: number,  // 0.0 ~ 1.0
  deductions: {
    motive: { correct: boolean, actual: string },
    method: { correct: boolean, actual: string },
    time: { correct: boolean, actual: string }
  },
  feedback: string,  // 판정 이유 설명
  epilogue: string  // 엔딩 텍스트
}
```

### 승리 조건 (구체화)

#### Normal Ending (일반 엔딩)
**필수 요건**:
1. **범인 정확히 지목** (`accusation.culprit === solution.culprit`)
2. **핵심 증거 60% 이상** (`accusation.evidence`에서 `solution_critical: true`인 단서 60% 이상 포함)
3. **증거 모순 없음** (제시된 증거가 서로 충돌하지 않음)

**점수 계산**:
```typescript
evidenceScore = (제시한 핵심 증거 수 / 전체 핵심 증거 수)
if (evidenceScore >= 0.6 && culpritCorrect) {
  return "normal_ending"
}
```

**엔딩 메시지 예시**:
```
"범인을 정확히 지목하셨습니다.
제시한 증거들로 기소가 가능합니다.
하지만 사건의 배후나 진짜 동기는 여전히 미스터리로 남았습니다..."
```

#### True Ending (진실 엔딩)
**추가 요건**:
4. **핵심 증거 90% 이상** 수집
5. **동기 정확히 파악** (`accusation.motive`가 `solution.motive`와 의미적으로 일치)
6. **범행 방법 정확히 파악** (`accusation.method`가 `solution.method`와 일치)
7. **배후/공범 발견** (`accusation.additionalFindings.mastermindFound === true`)
8. **거짓 증거 배제** (미끼 단서를 증거로 제시하지 않음)

**판정 로직**:
```typescript
if (evidenceScore >= 0.9 &&
    culpritCorrect &&
    motiveCorrect &&
    methodCorrect &&
    (mastermindFound || !solution.hasMastermind) &&
    !usedDecoyEvidence) {
  return "true_ending"
}
```

**엔딩 메시지 예시**:
```
"완벽합니다!
당신은 사건의 모든 진실을 밝혀냈습니다.
범인뿐 아니라 배후의 진짜 동기, 치밀한 범행 계획까지...
이 사건은 당신 덕분에 완전히 해결되었습니다."
```

#### Bad Ending (실패 엔딩)
**조건**:
- 범인을 잘못 지목 (`accusation.culprit !== solution.culprit`)
- 또는 핵심 증거가 60% 미만
- 또는 치명적으로 모순되는 증거 제시

**엔딩 메시지 예시**:
```
"제시하신 추리에는 중대한 오류가 있습니다.
[잘못된 부분 설명]
사건은 미해결로 종결되었고, 진짜 범인은 도주했습니다..."
```

#### Timeout Ending (시간 초과)
**조건**:
- 턴 수 초과 (Normal: 50턴, Hard: 30턴)

**엔딩 메시지**:
```
"시간이 너무 오래 걸렸습니다.
범인이 증거를 인멸하고 도주했습니다.
사건은 미제 사건으로 기록됩니다..."
```

### 패배 조건

1. **턴 수 초과**: Easy(무제한) / Normal(50턴) / Hard(30턴) 초과
2. **오판**: 잘못된 범인 지목 (재도전은 가능하지만 처음부터)
3. **치명적 선택**: 특정 드라마틱 선택지에서 나쁜 결정 (예: "범인을 놓아준다")

### 엔딩 분기

```json
{
  "endings": {
    "true_ending": {
      "id": "ending.true",
      "title": "완벽한 추리",
      "condition": {
        "culpritCorrect": true,
        "clueCoverage": 0.9,
        "requiredFlags": ["mastermind_found", "motive_revealed"]
      },
      "epilogue": "당신은 사건의 모든 진실을 밝혀냈습니다..."
    },
    "normal_ending": {
      "id": "ending.normal",
      "title": "범인 검거",
      "condition": {
        "culpritCorrect": true,
        "clueCoverage": 0.6
      },
      "epilogue": "범인을 잡았지만 뭔가 석연치 않은 부분이..."
    },
    "bad_ending": {
      "id": "ending.bad",
      "title": "미궁에 빠진 사건",
      "condition": {
        "culpritCorrect": false
      },
      "epilogue": "사건은 미해결로 종결되었습니다."
    },
    "timeout_ending": {
      "id": "ending.timeout",
      "title": "시간 초과",
      "condition": {
        "timeExpired": true
      },
      "epilogue": "범인이 증거를 인멸하고 도주했습니다."
    }
  }
}
```

---

## 🎲 난이도 시스템

### 난이도별 차이점

| 요소 | Easy | Normal | Hard |
|------|------|--------|------|
| 턴 수 제한 | 무제한 | 50턴 | 30턴 |
| 힌트 시스템 | 조력자 NPC 자동 힌트 (무제한) | 조력자 NPC 힌트 (최대 3회) | 힌트 없음 |
| 거짓말 NPC | 1명 (쉬운 거짓말) | 2명 (중간) | 3명 (교묘한 거짓말) |
| 미끼 단서 비율 | 10% | 20% | 30% |
| 재도전 허용 | 무제한 (처음부터) | 무제한 (처음부터) | 무제한 (처음부터) |
| 단서 키워드 매칭 | 관대함 (유사 단어 허용) | 보통 | 정확한 키워드 필요 |
| 물리적 증거 표시 | 모든 핫스팟 표시 | 일부 핫스팟만 표시 | 플레이어가 직접 클릭 탐색 |

---

## 🧠 LLM 행동 제어

### 프롬프트 구조

```
[System Prompt]
- 게임 규칙 전체 명시
- NPC 역할 정의
- 금지 사항 (스포일러 방지, 전지적 시점 금지)

[Developer Context] (매 메시지마다 동적 생성)
{
  "current_phase": "investigation",
  "npc_knowledge": [...],  // 이 NPC가 아는 단서 목록
  "player_clues": [...],   // 플레이어가 이미 수집한 단서
  "conversation_history": [...],
  "game_state": {
    "flags": ["met_detective", "searched_office"],
    "action_points": 12,
    "turn": 7
  },
  "deception_mode": {
    "allowed": true,
    "remaining_lies": 1
  }
}

[User Input]
플레이어 발화
```

### LLM 출력 제약

1. **스포일러 방지**
   - 범인/동기/방법을 직접 언급 금지
   - "박민서가 범인입니다"와 같은 명시적 답변 불가
   - 암시/복선은 허용 ("그 사람은 뭔가 숨기는 것 같아요")

2. **지식 범위 제한**
   - `npc_knowledge`에 없는 단서는 절대 언급 불가
   - 플레이어가 새로운 정보 제공 시 → 기존 지식과 결합하여 추가 힌트 제공

3. **단서 공개 조건**
   - `revealCondition`을 만족해야 단서 제공
   - 키워드 미포함 시 "그 부분은 잘 모르겠어요" 응답

4. **감정/태도 일관성**
   - NPC의 `personality`와 현재 `state`에 맞는 말투/태도 유지
   - 증거에 몰리면 태도 변화 (defensive → desperate)

---

## 📊 케이스 제작 체크리스트

새로운 케이스를 만들 때 반드시 포함해야 할 요소:

### 1. 메타 정보 (case.meta.json)
- [ ] 케이스 ID, 제목, 시놉시스
- [ ] 예상 플레이 시간
- [ ] 난이도 설정
- [ ] 엔딩 종류 (최소 2개 이상)

### 2. 스토리 설계
- [ ] 명확한 범인 (1명 이상)
- [ ] 동기 (why?)
- [ ] 범행 방법 (how?)
- [ ] 시간대 (when?)
- [ ] 장소 (where?)
- [ ] 핵심 모순점 (플레이어가 찾아야 할 논리적 허점)

### 3. NPC 설계 (최소 3명)
- [ ] 범인 1명
- [ ] 목격자/협조자 1명 이상
- [ ] 미끼/무고한 용의자 1명 이상
- 각 NPC마다:
  - [ ] 성격, 말투 정의
  - [ ] 지식 범위 명시
  - [ ] 거짓말 허용 여부 + 거짓말 내용
  - [ ] 태도 변화 조건

### 4. 단서 설계 (최소 10개)
- [ ] 핵심 단서 (`solution_critical: true`) 5개 이상
- [ ] 보조 단서 3개 이상
- [ ] 미끼 단서 2개 이상
- 각 단서마다:
  - [ ] 공개 조건 명시
  - [ ] 연관 단서 연결 (supports/contradicts)
  - [ ] 중요도 점수 (importance)

### 5. 상태 머신 (states.json)
- [ ] 4개 페이즈 전환 조건 정의
- [ ] 각 페이즈별 LLM 행동 지침
- [ ] 드라마틱 선택지 타이밍 (최소 1회)

### 6. 해답 정의 (solution.json)
```json
{
  "culprit": "npc.suspect.minseo",
  "motive": {
    "primary": "보험금 수령",
    "secondary": "재산 상속 다툼",
    "keywords": ["보험금", "상속", "금전", "재산"]
  },
  "method": {
    "description": "수면제를 탄 와인 제공 후 추락 위장",
    "keywords": ["수면제", "와인", "추락", "위장"],
    "steps": [
      "피해자에게 수면제 혼합 와인 제공",
      "의식 잃은 피해자를 옥상으로 운반",
      "추락 사고로 위장"
    ]
  },
  "timeOfCrime": "23:40",
  "criticalClues": [
    "clue.fingerprint.wineglass",
    "clue.timeline.contradiction",
    "clue.insurance.beneficiary",
    "clue.sleeping_pill.prescription",
    "clue.rooftop.access"
  ],
  "decoyClues": [
    "clue.fake.witness_far",
    "clue.fake.weapon_knife"
  ],
  "hasMastermind": false,
  "hasAccomplice": false,
  "timeline": [
    {"time": "22:00", "event": "피해자와 와인 마심", "location": "피해자 집"},
    {"time": "23:30", "event": "피해자 의식 잃음", "location": "피해자 집"},
    {"time": "23:40", "event": "옥상에서 추락 (위장)", "location": "건물 옥상"},
    {"time": "00:15", "event": "용의자 귀가", "location": "용의자 집"}
  ],
  "endingThresholds": {
    "true_ending": {
      "evidenceScore": 0.9,
      "motiveMatch": true,
      "methodMatch": true,
      "timeMatch": true
    },
    "normal_ending": {
      "evidenceScore": 0.6,
      "culpritCorrect": true
    }
  }
}
```

---

## 🔧 구현 우선순위

현재 코드베이스에 이 스펙을 적용하기 위한 작업 순서:

### Phase 1: 핵심 시스템 (필수)
1. [ ] 페이즈 전환 로직 구현 (`SessionsService`에 phase 추적)
2. [ ] 단서 공개 조건 검증 로직 (`context-builder`에서 필터링)
3. [ ] 단서 수집 추적 시스템 (Session에 `discoveredClues` 저장)
4. [ ] 승패 판정 엔드포인트 (`POST /sessions/:id/accuse`)
5. [ ] LLM 프롬프트에 지식 범위 제약 추가

### Phase 2: 게임 플레이 (중요)
6. [ ] 행동 포인트 시스템 (선택적)
7. [ ] 시간 제한 추적 (Session에 `startedAt`, `currentPhase` 저장)
8. [ ] 드라마틱 선택지를 페이즈별로 조건부 노출
9. [ ] NPC 태도 변화 시스템 (flags 기반 behavior 전환)
10. [ ] 힌트 시스템 (난이도별)

### Phase 3: UX 개선 (부가)
11. [ ] 추리 노트 UI (수집한 단서 정리)
12. [ ] 단서 연결 시각화 (관계도)
13. [ ] 타임라인 시각화 (사건 재구성)
14. [ ] 엔딩 스크린 + 해설
15. [ ] 리플레이 기능

---

## ✅ 확정된 설계 방향 (Design Decisions)

### A. 페이즈 전환 방식
**✅ 결정**: Soft Phase 시스템 (자동 전환 + 이전 기능 유지)
- 조건 충족 시 자동으로 새 기능 해금
- 이전 단계 기능은 제거하지 않음 (언제든 추가 수사 가능)
- UI에서 명시적 "Phase 2" 노출 안 함 → "사건 진행도 XX%" 표시

### B. 행동 포인트 시스템
**✅ 결정**: 구현하지 않음. 턴 수 제한으로 대체
- Easy: 무제한 / Normal: 50턴 / Hard: 30턴
- 질문 1회 = 1턴
- UI 표시: "남은 질문 기회: XX회"

### C. 재도전 허용 여부
**✅ 결정**: 무제한 재도전 허용 (단, 세이브 포인트 없음)
- 오판 시 처음부터 다시 시작
- 세이브/로드 기능 없음 (긴장감 유지)
- 모든 난이도 동일

### D. 거짓말 탐지 메커니즘
**✅ 결정**: 암시적 탐지 (증거 기반)
- "거짓말 탐지" 버튼 없음
- 플레이어가 증거를 제시하며 추궁해야 함
- 거짓말 들통 → NPC가 새로운 정보 실토

### E. 힌트 시스템 설계
**✅ 결정**: 조력자 NPC를 통한 자연스러운 힌트 제공
- 명시적 "힌트 버튼" 없음
- 조력자 NPC와 대화 시 자동 트리거
- 조건: 진전 없음 / 모순 놓침 / 거짓말 미적발
- 난이도별: Easy(무제한) / Normal(3회) / Hard(없음)

### F. 단서 수집 방식
**✅ 결정**: 2-Tier 시스템 (물리적 증거 자동 + 대화 단서 수동)
- **Tier 1 (물리적 증거)**: 이미지 핫스팟 클릭으로 자동 수집
- **Tier 2 (대화 단서)**: 플레이어가 추리 노트에 직접 작성
- 대화 흐름 기반 공개: 키워드 클러스터 + 컨텍스트 판단 (LLM)

---

## 📝 다음 단계

이 정의서를 바탕으로:

1. **케이스 c001 완성**: 위 체크리스트에 맞춰 전체 데이터 작성
2. **코드 구현**: Phase 1 우선순위 항목부터 구현
3. **테스트 플레이**: 실제 게임 플레이하며 밸런스 조정
4. **프롬프트 튜닝**: LLM이 규칙을 제대로 따르는지 검증

---

**이 문서는 작업 중인 초안입니다. 논의 후 수정/확장됩니다.**
