# 최종 결론 제출 및 판정 시스템 (Accusation & Judgment System)

## 📋 문서 목적
최종 추리 제출 UI, 판정 로직, 엔딩 분기의 상세 구현 명세

---

## 🎨 UI/UX 설계

### 1. 결론 제출 버튼 활성화 조건

**위치**: 추리 노트 하단 또는 화면 우측 상단

**활성화 조건**:
- Stage 3 (Deduction) 이상 도달
- 또는 플레이어가 명시적으로 "결론 제출 모드" 진입 선언

**비활성화 상태**:
```
[🔒 결론 제출]
(단서를 더 수집하세요)
```

**활성화 상태**:
```
[✅ 결론 제출]
(클릭하여 최종 추리를 제출하세요)
```

---

### 2. 결론 제출 모달 UI

#### 레이아웃 (자유 서술형)

```
┌────────────────────────────────────────────────────────────┐
│  최종 추리 제출                                     [X]     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ⚠️  주의: 제출 후에는 수정할 수 없습니다!                 │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                            │
│  1️⃣  범인 지목 (필수) *                                   │
│                                                            │
│     [드롭다운 ▼] 선택하세요                                │
│                                                            │
│     용의자 목록:                                           │
│     ○ 박민서 (용의자, 피해자 연인)                        │
│     ○ 김도일 (목격자, 이웃)                               │
│     ○ 이수진 (피해자 친구)                                │
│     ○ 범인 없음 (자살 또는 사고)                          │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                            │
│  2️⃣  추리의 근거 (필수) *                                 │
│                                                            │
│     당신의 추리를 뒷받침하는 근거를 자유롭게 작성하세요.    │
│     증거, 증언, 모순점, 타임라인 등을 논리적으로 나열하세요.│
│                                                            │
│     [──────────────────────────────────────────────────]   │
│     │ 1. 와인잔에서 박민서의 지문이 발견되었으나,     │      │
│     │    피해자는 평소 술을 마시지 않는다는 증언이   │      │
│     │    있었다. 이는 박민서가 와인을 준비했음을     │      │
│     │    의미한다.                                   │      │
│     │                                                │      │
│     │ 2. CCTV에는 23시 15분 박민서가 역에 나타났다. │      │
│     │    그러나 박민서는 23시에 집에 있었다고       │      │
│     │    거짓말을 했다. 이후 추궁하자 피해자 집     │      │
│     │    근처에 있었다고 시인했다.                  │      │
│     │                                                │      │
│     │ 3. 보험금 수익자가 박민서로 되어 있고,        │      │
│     │    최근 결별한 상황에서 재산 다툼이 있었다는  │      │
│     │    증언이 있다. 금전적 동기가 명확하다.       │      │
│     │                                                │      │
│     │ 4. 박민서의 수면제 처방 기록이 있고,          │      │
│     │    피해자의 혈액에서 수면제 성분이 검출되었다.│      │
│     │    와인에 수면제를 탔을 가능성이 높다.        │      │
│     │                                                │      │
│     │ 5. 이웃이 23시경 소음을 들었다는 증언과,      │      │
│     │    옥상 출입 기록이 23시 40분에 있다.         │      │
│     │    이는 범행 시간과 일치한다.                 │      │
│     [──────────────────────────────────────────────────]   │
│                                                            │
│     💡 작성 가이드:                                        │
│     • 수집한 물리적 증거를 언급하세요                      │
│     • NPC의 증언과 모순점을 지적하세요                     │
│     • 시간대별 사건 흐름을 설명하세요                      │
│     • 동기와 방법을 논리적으로 연결하세요                  │
│                                                            │
│     최소 200자 이상 권장 | 현재: 487자                     │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                            │
│  3️⃣  추가 정보 (선택)                                     │
│                                                            │
│     ☐ 공범이 존재합니다 → 공범: [드롭다운 ▼]              │
│     ☐ 배후 인물을 발견했습니다 → 배후: [드롭다운 ▼]       │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                            │
│  [← 취소]                  [제출하기 →]                   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**핵심 변경점**:
- ❌ 증거 체크박스 제거 (목록화된 증거 선택 방식 폐기)
- ✅ "추리의 근거" 자유 서술형 텍스트 영역 추가
- ✅ 플레이어가 자연스럽게 논리를 전개하도록 유도
- ✅ 동기/방법/시간 필드 제거 (근거 텍스트에 포함)

#### 입력 검증

**제출 버튼 클릭 시 검증**:
```typescript
function validateAccusation(data: FinalAccusation): ValidationResult {
  const errors = [];

  // 1. 범인 필수
  if (!data.culprit) {
    errors.push("범인을 지목해주세요.");
  }

  // 2. 추리 근거 필수 (최소 글자 수)
  if (!data.reasoning || data.reasoning.trim().length < 100) {
    errors.push(`추리의 근거를 작성해주세요. (최소 100자, 현재 ${data.reasoning?.trim().length || 0}자)`);
  }

  // 3. 공범 체크박스 선택 시 공범 ID 필수
  if (data.additionalFindings?.hasAccomplice && !data.additionalFindings?.accompliceId) {
    errors.push("공범을 선택해주세요.");
  }

  // 4. 배후 체크박스 선택 시 배후 ID 필수
  if (data.additionalFindings?.mastermindFound && !data.additionalFindings?.mastermindId) {
    errors.push("배후 인물을 선택해주세요.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

**검증 실패 시 UI**:
```
❌ 다음 항목을 확인해주세요:
• 범인을 지목해주세요.
• 추리의 근거를 작성해주세요. (최소 100자, 현재 45자)
```

---

### 3. 제출 확인 다이얼로그

```
┌──────────────────────────────────────┐
│  정말 제출하시겠습니까?               │
├──────────────────────────────────────┤
│                                      │
│  ⚠️  한 번 제출하면 수정할 수 없으며, │
│     즉시 엔딩으로 진행됩니다.         │
│                                      │
│  선택하신 범인: 박민서 (용의자)       │
│  제시한 증거: 4개                    │
│                                      │
│  [아니오]          [네, 제출합니다]  │
│                                      │
└──────────────────────────────────────┘
```

---

## ⚖️ 판정 로직 (Backend)

### 1. API 엔드포인트

```typescript
POST /sessions/:id/accuse

Request Body:
{
  culprit: "npc.suspect.minseo",
  reasoning: "1. 와인잔에서 박민서의 지문이 발견되었으나, 피해자는 평소 술을 마시지 않는다는 증언이 있었다. 이는 박민서가 와인을 준비했음을 의미한다.\n\n2. CCTV에는 23시 15분 박민서가 역에 나타났다. 그러나 박민서는 23시에 집에 있었다고 거짓말을 했다. 이후 추궁하자 피해자 집 근처에 있었다고 시인했다.\n\n3. 보험금 수익자가 박민서로 되어 있고, 최근 결별한 상황에서 재산 다툼이 있었다는 증언이 있다. 금전적 동기가 명확하다.\n\n4. 박민서의 수면제 처방 기록이 있고, 피해자의 혈액에서 수면제 성분이 검출되었다. 와인에 수면제를 탔을 가능성이 높다.\n\n5. 이웃이 23시경 소음을 들었다는 증언과, 옥상 출입 기록이 23시 40분에 있다. 이는 범행 시간과 일치한다.",
  additionalFindings: {
    hasAccomplice: false,
    mastermindFound: false
  },
  submittedAt: "2025-01-15T14:30:00Z"
}

Response:
{
  result: "true_ending",
  correctCulprit: true,
  reasoning_analysis: {
    overall_score: 0.95,
    evidence_mentioned: [
      "clue.fingerprint.wineglass",
      "clue.cctv.station",
      "clue.insurance.beneficiary",
      "clue.sleeping_pill.prescription",
      "clue.rooftop.access",
      "clue.testimony.neighbor_noise"
    ],
    critical_evidence_coverage: 0.9,  // 핵심 증거 90% 언급
    motive_identified: true,
    method_identified: true,
    time_identified: true,
    logical_flow: true,  // 논리적 흐름 적절함
    contradictions: []  // 모순 없음
  },
  feedback: "완벽한 추리입니다! 핵심 증거를 모두 언급했고, 동기와 방법, 시간을 정확히 밝혀냈습니다. 논리적 흐름도 자연스럽습니다.",
  epilogue: "당신은 사건의 모든 진실을 밝혀냈습니다...",
  score: 98
}
```

### 2. LLM 기반 판정 알고리즘

**핵심 아이디어**: GPT API를 사용하여 플레이어의 추리 텍스트를 분석하고 타당성 평가

```typescript
interface Solution {
  culprit: string;
  motive: {
    primary: string;
    keywords: string[];
  };
  method: {
    description: string;
    keywords: string[];
    steps: string[];
  };
  timeOfCrime: string;
  criticalClues: string[];  // 핵심 증거 목록
  decoyClues: string[];     // 미끼 증거 목록
  timeline: Array<{ time: string; event: string; location: string }>;
  hasMastermind: boolean;
  hasAccomplice: boolean;
}

async function judgeAccusation(
  accusation: FinalAccusation,
  solution: Solution,
  session: Session,
  allClues: Clue[]  // 케이스의 모든 단서 정보
): Promise<JudgmentResult> {

  // 1. 범인 정확도 체크
  const culpritCorrect = accusation.culprit === solution.culprit;

  // 2. LLM을 사용하여 추리 근거 분석
  const reasoningAnalysis = await analyzeReasoningWithLLM(
    accusation.reasoning,
    solution,
    allClues
  );

  // 3. 엔딩 판정
  let result: EndingType;

  if (!culpritCorrect || reasoningAnalysis.critical_evidence_coverage < 0.6) {
    result = "bad_ending";
  } else if (
    reasoningAnalysis.critical_evidence_coverage >= 0.9 &&
    reasoningAnalysis.motive_identified &&
    reasoningAnalysis.method_identified &&
    reasoningAnalysis.logical_flow &&
    reasoningAnalysis.contradictions.length === 0 &&
    (!solution.hasMastermind || accusation.additionalFindings?.mastermindFound)
  ) {
    result = "true_ending";
  } else {
    result = "normal_ending";
  }

  return {
    result,
    correctCulprit,
    reasoning_analysis: reasoningAnalysis,
    feedback: generateFeedback(result, culpritCorrect, reasoningAnalysis),
    epilogue: getEpilogue(result, solution),
    score: calculateScore(culpritCorrect, reasoningAnalysis)
  };
}
```

### 3. LLM 분석 함수 (핵심)

```typescript
interface ReasoningAnalysis {
  overall_score: number;             // 0.0 ~ 1.0
  evidence_mentioned: string[];      // 플레이어가 언급한 증거 코드 목록
  critical_evidence_coverage: number; // 핵심 증거 언급 비율
  motive_identified: boolean;        // 동기 파악 여부
  method_identified: boolean;        // 방법 파악 여부
  time_identified: boolean;          // 시간 추정 여부
  logical_flow: boolean;             // 논리적 흐름 적절성
  contradictions: string[];          // 발견된 논리적 모순
  llm_feedback: string;              // LLM이 생성한 피드백
}

async function analyzeReasoningWithLLM(
  playerReasoning: string,
  solution: Solution,
  allClues: Clue[]
): Promise<ReasoningAnalysis> {

  // 단서 정보를 LLM이 이해할 수 있도록 포맷팅
  const cluesContext = allClues.map(clue => ({
    code: clue.code,
    title: clue.title,
    description: clue.description,
    isCritical: solution.criticalClues.includes(clue.code),
    isDecoy: solution.decoyClues.includes(clue.code)
  }));

  const prompt = `
당신은 추리 게임의 판정관입니다. 플레이어의 추리를 평가해주세요.

# 사건 정보
범인: ${solution.culprit}
동기: ${solution.motive.primary}
방법: ${solution.method.description}
범행 시간: ${solution.timeOfCrime}

# 핵심 증거 목록
${solution.criticalClues.map(code => {
  const clue = allClues.find(c => c.code === code);
  return `- ${code}: ${clue?.title} - ${clue?.description}`;
}).join('\n')}

# 미끼 증거 목록
${solution.decoyClues.map(code => {
  const clue = allClues.find(c => c.code === code);
  return `- ${code}: ${clue?.title} (미끼)`;
}).join('\n')}

# 플레이어의 추리
${playerReasoning}

# 평가 기준
1. 플레이어가 언급한 증거가 실제로 존재하는가?
2. 핵심 증거를 얼마나 많이 언급했는가? (비율로 계산)
3. 동기를 정확히 파악했는가? (키워드: ${solution.motive.keywords.join(', ')})
4. 방법을 정확히 파악했는가? (키워드: ${solution.method.keywords.join(', ')})
5. 시간을 정확히 추정했는가? (정답: ${solution.timeOfCrime})
6. 논리적 흐름이 자연스러운가?
7. 미끼 증거를 사용했는가?
8. 논리적 모순이 있는가?

아래 JSON 형식으로 응답하세요:
{
  "overall_score": 0.95,
  "evidence_mentioned": ["clue.fingerprint.wineglass", "clue.cctv.station", ...],
  "critical_evidence_coverage": 0.9,
  "motive_identified": true,
  "method_identified": true,
  "time_identified": true,
  "logical_flow": true,
  "contradictions": [],
  "llm_feedback": "완벽한 추리입니다. 핵심 증거를 모두 언급했고..."
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",  // 복잡한 분석이므로 성능 좋은 모델 사용
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,  // 일관성을 위해 낮은 온도
    response_format: { type: "json_object" }  // JSON 모드 강제
  });

  const analysis = JSON.parse(response.choices[0].message.content);

  return analysis as ReasoningAnalysis;
}
```

### 4. 점수 계산

```typescript
function calculateScore(
  culpritCorrect: boolean,
  reasoningAnalysis: ReasoningAnalysis
): number {
  let score = 0;

  // 범인 (40점)
  if (culpritCorrect) score += 40;

  // 증거 커버리지 (30점)
  score += Math.round(reasoningAnalysis.critical_evidence_coverage * 30);

  // 동기 파악 (10점)
  if (reasoningAnalysis.motive_identified) score += 10;

  // 방법 파악 (10점)
  if (reasoningAnalysis.method_identified) score += 10;

  // 논리적 흐름 (5점)
  if (reasoningAnalysis.logical_flow) score += 5;

  // 시간 정확도 (보너스 5점)
  if (reasoningAnalysis.time_identified) score += 5;

  return Math.min(score, 100);
}
```

### 5. 피드백 생성

```typescript
function generateFeedback(
  result: EndingType,
  culpritCorrect: boolean,
  analysis: ReasoningAnalysis
): string {

  // LLM이 이미 생성한 피드백이 있으면 그것을 기반으로 보강
  let feedback = analysis.llm_feedback || "";

  if (result === "true_ending") {
    return feedback || "완벽한 추리입니다! 모든 증거를 논리적으로 연결했습니다.";
  }

  if (result === "normal_ending") {
    const missing = [];
    if (!analysis.motive_identified) missing.push("동기");
    if (!analysis.method_identified) missing.push("방법");

    if (missing.length > 0) {
      feedback += `\n\n범인은 정확하지만 ${missing.join("과 ")}를 명확히 밝히지 못했습니다.`;
    }
    return feedback;
  }

  if (result === "bad_ending") {
    if (!culpritCorrect) {
      return "범인 지목이 잘못되었습니다. 증거를 다시 검토해보세요.";
    }
    if (analysis.critical_evidence_coverage < 0.6) {
      return `핵심 증거가 부족합니다. (${Math.round(analysis.critical_evidence_coverage * 100)}%) 더 많은 증거를 수집하세요.`;
    }
    if (analysis.contradictions.length > 0) {
      return `논리적 모순이 있습니다: ${analysis.contradictions.join(', ')}`;
    }
  }

  return feedback || "사건 해결에 실패했습니다.";
}
```

---

## 🎬 엔딩 연출

### 1. 엔딩 화면 레이아웃 (수정)

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                     [엔딩 타입 아이콘]                      │
│                                                            │
│                     🏆 TRUE ENDING 🏆                      │
│                   완벽한 추리! 진실 규명                    │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                            │
│  당신은 사건의 모든 진실을 밝혀냈습니다.                    │
│  범인뿐 아니라 배후의 진짜 동기, 치밀한 범행 계획까지...    │
│  이 사건은 당신 덕분에 완전히 해결되었습니다.               │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                            │
│  📊 평가 결과                                              │
│                                                            │
│  범인 지목:     ✅ 정확                                    │
│  증거 언급:     ████████████░░ 90%                        │
│  동기 파악:     ✅ 정확                                    │
│  방법 파악:     ✅ 정확                                    │
│  논리적 흐름:   ✅ 적절                                    │
│                                                            │
│  총점: 98 / 100                                            │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                            │
│  💬 AI 판정관의 피드백                                     │
│                                                            │
│  "완벽한 추리입니다! 와인잔의 지문, CCTV 영상, 보험금     │
│   서류 등 핵심 증거를 모두 언급했고, 수면제를 이용한      │
│   범행 수법도 정확히 파악했습니다. 특히 박민서의          │
│   거짓 알리바이를 증거로 반박한 부분이 탁월했습니다."     │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                            │
│  📈 추리 과정 요약                                         │
│                                                            │
│  • 사용한 턴 수: 28 / 50                                  │
│  • 수집한 단서: 12 / 15 (80%)                             │
│  • 거짓말 적발: 2회                                        │
│  • 힌트 사용: 1회                                          │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                            │
│  [다시 플레이]  [다른 케이스]  [메인으로]                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**추가된 섹션**:
- ✅ "AI 판정관의 피드백" (LLM이 생성한 `llm_feedback` 표시)

---

## 🧪 테스트 케이스 (수정)

### Test Case 1: True Ending

```json
{
  "culprit": "npc.suspect.minseo",
  "reasoning": "1. 와인잔에서 박민서의 지문이 발견되었으나, 피해자는 평소 술을 마시지 않는다는 증언이 있었다. 이는 박민서가 와인을 준비했음을 의미한다.\n\n2. CCTV에는 23시 15분 박민서가 역에 나타났다. 그러나 박민서는 23시에 집에 있었다고 거짓말을 했다. 이후 추궁하자 피해자 집 근처에 있었다고 시인했다.\n\n3. 보험금 수익자가 박민서로 되어 있고, 최근 결별한 상황에서 재산 다툼이 있었다는 증언이 있다. 금전적 동기가 명확하다.\n\n4. 박민서의 수면제 처방 기록이 있고, 피해자의 혈액에서 수면제 성분이 검출되었다. 와인에 수면제를 탔을 가능성이 높다.\n\n5. 이웃이 23시경 소음을 들었다는 증언과, 옥상 출입 기록이 23시 40분에 있다. 박민서가 피해자를 옥상으로 운반하여 추락시킨 것으로 추정된다."
}

Expected:
- result: "true_ending"
- critical_evidence_coverage: >= 0.9
- motive_identified: true
- method_identified: true
- score: >= 95
```

### Test Case 2: Normal Ending

```json
{
  "culprit": "npc.suspect.minseo",
  "reasoning": "와인잔에서 박민서의 지문이 나왔고, CCTV에도 박민서가 찍혔습니다. 보험금 수익자도 박민서입니다. 박민서가 범인입니다."
}

Expected:
- result: "normal_ending"
- critical_evidence_coverage: >= 0.6 (3개 언급)
- motive_identified: false (구체적 설명 없음)
- method_identified: false
- score: 70~80
```

### Test Case 3: Bad Ending (Wrong Culprit)

```json
{
  "culprit": "npc.witness.neighbor",
  "reasoning": "이웃이 23시에 소음을 들었다고 증언했는데, 이는 거짓말입니다. 이웃이 범인입니다."
}

Expected:
- result: "bad_ending"
- correctCulprit: false
- score: < 40
```

### Test Case 4: Bad Ending (Insufficient Evidence)

```json
{
  "culprit": "npc.suspect.minseo",
  "reasoning": "박민서가 수상해 보입니다."
}

Expected:
- result: "bad_ending"
- critical_evidence_coverage: < 0.1
- feedback: "핵심 증거가 부족합니다"
```

### Test Case 5: Bad Ending (Contradictions)

```json
{
  "culprit": "npc.suspect.minseo",
  "reasoning": "박민서가 범인입니다. 피해자는 자살했지만, 박민서가 살해했습니다."
}

Expected:
- result: "bad_ending"
- contradictions: ["자살과 타살 주장이 모순"]
```

---

## LLM 기반 판정의 장점

### ✅ 유연성
- 플레이어가 어떤 표현을 써도 의미만 맞으면 인정
- "보험금을 타려고" = "보험금 수령 목적" = "금전적 이득"

### ✅ 자연스러운 추리 경험
- 체크박스 선택이 아닌 실제 탐정처럼 추리 서술
- 증거를 나열하는 것이 아니라 **논리적으로 연결**해야 함

### ✅ 상황 인식 판단
- "그날 비가 왔다"는 증언 + "진흙 발자국" 증거 → LLM이 연관성 파악
- 명시적으로 목록에 없는 증거도 자연스럽게 인정 가능

### ✅ 피드백 품질
- LLM이 구체적이고 개인화된 피드백 생성
- "CCTV 증거로 거짓 알리바이를 반박한 부분이 탁월했습니다"

---

## ⚠️ 고려사항

### 1. LLM 비용
- GPT-4o 사용 시 비용 발생
- 한 게임당 1회만 호출되므로 허용 가능한 수준

### 2. 응답 시간
- LLM 분석에 2~5초 소요
- "판정 중..." 로딩 UI 필요

### 3. 일관성 보장
- `temperature: 0.3` 사용
- JSON 모드 강제로 구조 보장
- 테스트 케이스로 검증 필요

---

**이 시스템은 진짜 추리 게임다운 경험을 제공합니다!**

```typescript
async function checkMotiveMatch(
  playerMotive: string,
  solutionMotive: { primary: string; keywords: string[] }
): Promise<boolean> {

  // OpenAI를 사용하여 의미적 유사도 판단
  const prompt = `
다음 두 동기가 본질적으로 같은 의미인지 판단하세요.

정답 동기: ${solutionMotive.primary}
플레이어 답변: ${playerMotive}

핵심 키워드: ${solutionMotive.keywords.join(", ")}

판단 기준:
- 핵심 키워드가 포함되어 있는가?
- 본질적인 의미가 일치하는가?
- 사소한 표현 차이는 무시

응답: "일치" 또는 "불일치"
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3
  });

  return response.choices[0].message.content.includes("일치");
}
```

#### 키워드 기반 매칭 (대안)

```typescript
function checkMotiveMatchSimple(
  playerMotive: string,
  solutionMotive: { primary: string; keywords: string[] }
): boolean {

  const normalizedPlayer = playerMotive.toLowerCase().replace(/\s+/g, "");

  // 키워드 중 60% 이상 포함되면 정답 처리
  const matchedKeywords = solutionMotive.keywords.filter(keyword =>
    normalizedPlayer.includes(keyword.toLowerCase())
  );

  return matchedKeywords.length / solutionMotive.keywords.length >= 0.6;
}
```

### 4. 증거 분석 함수

```typescript
interface EvidenceAnalysis {
  total: number;           // 제시한 총 증거 수
  criticalCount: number;   // 핵심 증거 수
  supportCount: number;    // 보조 증거 수
  decoyCount: number;      // 미끼 증거 수
  contradictions: string[]; // 모순되는 증거 조합
}

function analyzeEvidence(
  submittedEvidence: string[],
  solution: Solution
): EvidenceAnalysis {

  let criticalCount = 0;
  let supportCount = 0;
  let decoyCount = 0;
  const contradictions: string[] = [];

  for (const evidenceCode of submittedEvidence) {
    // 핵심 증거인가?
    if (solution.criticalClues.includes(evidenceCode)) {
      criticalCount++;
    }
    // 미끼 증거인가?
    else if (solution.decoyClues.includes(evidenceCode)) {
      decoyCount++;
    }
    // 보조 증거
    else {
      supportCount++;
    }
  }

  // 모순 체크 (예: clue.suicide_note vs clue.murder_weapon)
  const contradictPairs = [
    ["clue.suicide_note", "clue.murder_weapon"],
    ["clue.alibi.confirmed", "clue.cctv.at_scene"]
  ];

  for (const [clue1, clue2] of contradictPairs) {
    if (submittedEvidence.includes(clue1) && submittedEvidence.includes(clue2)) {
      contradictions.push(`${clue1} ↔ ${clue2}`);
    }
  }

  return {
    total: submittedEvidence.length,
    criticalCount,
    supportCount,
    decoyCount,
    contradictions
  };
}
```

---

## 🎬 엔딩 연출

### 1. 엔딩 화면 레이아웃

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                     [엔딩 타입 아이콘]                      │
│                                                            │
│                     🏆 TRUE ENDING 🏆                      │
│                   완벽한 추리! 진실 규명                    │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                            │
│  당신은 사건의 모든 진실을 밝혀냈습니다.                    │
│  범인뿐 아니라 배후의 진짜 동기, 치밀한 범행 계획까지...    │
│  이 사건은 당신 덕분에 완전히 해결되었습니다.               │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                            │
│  📊 평가 결과                                              │
│                                                            │
│  범인 지목:     ✅ 정확                                    │
│  증거 정확도:   ████████████░░ 95%                        │
│  동기 파악:     ✅ 정확                                    │
│  방법 파악:     ✅ 정확                                    │
│  시간 추정:     ✅ 정확 (23:40)                            │
│                                                            │
│  총점: 98 / 100                                            │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                            │
│  💡 추리 과정 요약                                         │
│                                                            │
│  • 사용한 턴 수: 28 / 50                                  │
│  • 수집한 단서: 12 / 15 (80%)                             │
│  • 거짓말 적발: 2회                                        │
│  • 힌트 사용: 1회                                          │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                            │
│  [다시 플레이]  [다른 케이스]  [메인으로]                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 2. 엔딩별 아이콘 & 색상

| 엔딩 | 아이콘 | 색상 | 타이틀 |
|------|--------|------|--------|
| True Ending | 🏆 | Gold | 완벽한 추리! 진실 규명 |
| Normal Ending | ✅ | Blue | 범인 검거 성공 |
| Bad Ending | ❌ | Red | 미궁에 빠진 사건 |
| Timeout | ⏰ | Gray | 시간 초과 |

### 3. 피드백 메시지 생성

```typescript
function generateFeedback(
  result: EndingType,
  culpritCorrect: boolean,
  evidenceScore: number,
  motiveCorrect: boolean,
  methodCorrect: boolean
): string {

  if (result === "true_ending") {
    return "완벽한 추리입니다! 모든 증거가 정확하고 동기와 방법도 명확히 밝혀냈습니다.";
  }

  if (result === "normal_ending") {
    const missing = [];
    if (!motiveCorrect) missing.push("동기");
    if (!methodCorrect) missing.push("방법");

    return `범인을 정확히 지목하셨습니다. 하지만 ${missing.join("와 ")}는 밝혀내지 못했습니다.`;
  }

  if (result === "bad_ending") {
    if (!culpritCorrect) {
      return "범인 지목이 잘못되었습니다. 증거를 다시 검토해보세요.";
    }
    if (evidenceScore < 0.6) {
      return `증거가 부족합니다. (${Math.round(evidenceScore * 100)}%) 핵심 증거를 더 수집하세요.`;
    }
  }

  return "사건 해결에 실패했습니다.";
}
```

---

## 📊 점수 계산

```typescript
function calculateScore(
  culpritCorrect: boolean,
  evidenceScore: number,
  motiveCorrect: boolean,
  methodCorrect: boolean,
  timeCorrect: boolean
): number {

  let score = 0;

  // 범인 (40점)
  if (culpritCorrect) score += 40;

  // 증거 (30점)
  score += Math.round(evidenceScore * 30);

  // 동기 (15점)
  if (motiveCorrect) score += 15;

  // 방법 (15점)
  if (methodCorrect) score += 15;

  // 시간 (보너스 5점)
  if (timeCorrect) score += 5;

  return Math.min(score, 100);
}
```

---

## 🔄 재도전 흐름

```
Bad Ending 화면
   ↓
[다시 플레이] 클릭
   ↓
확인 다이얼로그:
"처음부터 다시 시작하시겠습니까?
(현재 진행 상황은 저장되지 않습니다)"
   ↓
[확인] 클릭
   ↓
새 세션 생성 (session ID 신규 발급)
   ↓
Stage 1 (Introduction)부터 재시작
```

**중요**: 세이브 포인트 없음. 항상 처음부터.

---

## 🧪 테스트 케이스

### Test Case 1: True Ending
```json
{
  "culprit": "npc.suspect.minseo",
  "evidence": [
    "clue.fingerprint.wineglass",
    "clue.cctv.station",
    "clue.insurance.beneficiary",
    "clue.sleeping_pill.prescription",
    "clue.rooftop.access"
  ],
  "motive": "보험금 수령",
  "method": "수면제 혼합 와인 제공 후 추락 위장",
  "timeOfCrime": "23:40"
}

Expected: result = "true_ending", score >= 95
```

### Test Case 2: Normal Ending
```json
{
  "culprit": "npc.suspect.minseo",
  "evidence": [
    "clue.fingerprint.wineglass",
    "clue.cctv.station",
    "clue.insurance.beneficiary"
  ]
}

Expected: result = "normal_ending", score >= 70
```

### Test Case 3: Bad Ending (Wrong Culprit)
```json
{
  "culprit": "npc.witness.neighbor",
  "evidence": [
    "clue.cctv.station",
    "clue.testimony.noise"
  ]
}

Expected: result = "bad_ending", score < 60
```

### Test Case 4: Bad Ending (Insufficient Evidence)
```json
{
  "culprit": "npc.suspect.minseo",
  "evidence": [
    "clue.testimony.noise"
  ]
}

Expected: result = "bad_ending", feedback includes "증거가 부족"
```

---

**이 문서는 GAME_DESIGN_SPEC.md의 보충 자료입니다.**
