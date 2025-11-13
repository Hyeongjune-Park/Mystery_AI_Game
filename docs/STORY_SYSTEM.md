# Story & Cutscene System

스토리라인과 컷신 시스템은 사용자가 게임의 흐름과 분기점을 자유롭게 조작할 수 있도록 설계되었습니다.

## 개요

- **Story Files**: 이미지 + 자막 조합으로 구성된 개별 스토리/컷신
- **Flow File**: 게임 전체 흐름, 분기점, 조건부 이벤트 관리
- **Images**: 케이스별 이미지 에셋

## 파일 구조

```
cases/c001/
├── stories/              # 스토리 파일들
│   ├── intro.json        # 게임 시작 인트로
│   ├── knife_discovery.json
│   ├── confrontation_intro.json
│   ├── true_ending.json
│   └── false_ending.json
├── images/               # 이미지 에셋
│   ├── intro_scene01.jpg
│   ├── intro_scene02.jpg
│   └── ...
└── flow.yaml             # 게임 흐름 설정
```

## Story File 형식

### 스키마

```json
{
  "id": "story_id",
  "title": "스토리 제목",
  "scenes": [
    {
      "image": "image_filename.jpg",
      "caption": "장면 설명 자막"
    }
  ]
}
```

### 예시 (`intro.json`)

```json
{
  "id": "intro",
  "title": "프롤로그: 사건의 시작",
  "scenes": [
    {
      "image": "intro_scene01.jpg",
      "caption": "2024년 3월 15일 금요일, 서울 강남구 타워팰리스"
    },
    {
      "image": "intro_scene02.jpg",
      "caption": "새벽 6시 30분, 경비원의 신고로 경찰이 출동했다."
    }
  ]
}
```

## Flow File 형식 (`flow.yaml`)

### 주요 섹션

#### 1. Game Start
```yaml
gameStart:
  story: "intro.json"  # 게임 시작 시 재생할 스토리
```

#### 2. Phases (게임 페이즈)
```yaml
phases:
  - id: "investigation"
    name: "초기 수사"
    description: "현장을 조사하고 증거를 수집하는 단계"
```

#### 3. Triggers (조건부 트리거)
```yaml
triggers:
  - id: "knife_found"
    condition:
      type: "clue_discovered"
      clueId: "bloody_knife"
    action:
      type: "cutscene"
      story: "knife_discovery.json"
```

#### 4. Endings (엔딩 분기)
```yaml
endings:
  - id: "true_ending"
    name: "진실 엔딩"
    condition:
      type: "all"
      conditions:
        - type: "clues_discovered"
          clueIds: ["bloody_knife", "financial_records", "cctv_footage"]
          operator: "all"
    story: "true_ending.json"
    score: 100
```

## Condition Types (조건 타입)

### `clue_discovered`
특정 증거가 발견되었는지 확인
```yaml
condition:
  type: "clue_discovered"
  clueId: "bloody_knife"
```

### `clues_discovered`
여러 증거 조건 (all/any)
```yaml
condition:
  type: "clues_discovered"
  clueIds: ["knife", "records", "cctv"]
  operator: "all"  # 또는 "any"
```

### `npc_interrogated`
특정 NPC와 대화 횟수
```yaml
condition:
  type: "npc_interrogated"
  npcId: "lee_soohyun"
  minMessages: 5
```

### `time_elapsed`
게임 시작 후 경과 시간
```yaml
condition:
  type: "time_elapsed"
  minutes: 30
```

### `flag_check`
게임 플래그 확인
```yaml
condition:
  type: "flag_check"
  flag: "ready_for_confrontation"
  value: true
```

### `all` / `any`
복합 조건
```yaml
condition:
  type: "all"
  conditions:
    - type: "clue_discovered"
      clueId: "knife"
    - type: "npc_interrogated"
      npcId: "suspect"
```

## Action Types (액션 타입)

### `cutscene`
컷신 재생
```yaml
action:
  type: "cutscene"
  story: "knife_discovery.json"
```

### `phase_change`
게임 페이즈 변경
```yaml
action:
  type: "phase_change"
  nextPhase: "confrontation"
```

### `flag_set`
게임 플래그 설정
```yaml
action:
  type: "flag_set"
  flag: "ready_for_confrontation"
  value: true
```

### `hint`
힌트 표시
```yaml
action:
  type: "hint"
  message: "서재의 서랍을 더 자세히 살펴보세요."
```

### `multiple`
여러 액션 순차 실행
```yaml
action:
  type: "multiple"
  actions:
    - type: "phase_change"
      nextPhase: "confrontation"
    - type: "cutscene"
      story: "confrontation_intro.json"
```

## Backend API

### 스토리 조회
```
GET /story/:caseId/:storyFileName
```

**Response:**
```json
{
  "id": "intro",
  "title": "프롤로그",
  "scenes": [
    {
      "image": "intro_scene01.jpg",
      "imageUrl": "/api/proxy/story/c001/image/intro_scene01.jpg",
      "caption": "장면 설명"
    }
  ]
}
```

### Flow 설정 조회
```
GET /story/:caseId/flow
```

### 이미지 서빙
```
GET /story/:caseId/image/:imageFileName
```

## Frontend Components

### `<StoryViewer>`
스토리/컷신을 풀스크린으로 표시하는 컴포넌트

**Props:**
- `story: Story` - 표시할 스토리 객체
- `onComplete: () => void` - 스토리 완료 시 콜백
- `skippable?: boolean` - 건너뛰기 가능 여부 (기본: true)

**기능:**
- 장면별 이미지 + 자막 표시
- 키보드 네비게이션 (화살표, Space, Enter, ESC)
- 진행 상황 인디케이터
- 이미지 로딩 상태 처리

## 사용 예시

### 1. 게임 시작 시 인트로 재생

```tsx
const [currentStory, setCurrentStory] = useState<Story | null>(null);

useEffect(() => {
  const loadIntro = async () => {
    const flowConfig = await fetchFlowConfig(caseId);
    const story = await fetchStoryFile(caseId, flowConfig.gameStart.story);
    setCurrentStory(story);
  };
  loadIntro();
}, []);

{currentStory && (
  <StoryViewer
    story={currentStory}
    onComplete={() => setCurrentStory(null)}
  />
)}
```

### 2. 증거 발견 시 컷신 표시

백엔드에서 트리거 평가 후 액션 반환:

```typescript
const actions = await flowEvaluator.evaluateTriggers(flowConfig, gameState);

// actions: [{ type: 'cutscene', story: 'knife_discovery.json' }]
```

프론트엔드에서 액션 처리:

```tsx
if (action.type === 'cutscene') {
  const story = await fetchStoryFile(caseId, action.story);
  setCurrentStory(story);
}
```

### 3. 엔딩 분기

게임 종료 시 조건에 따라 다른 엔딩 표시:

```typescript
const endingStory = await flowEvaluator.evaluateEnding(flowConfig, gameState);

if (endingStory) {
  const story = await fetchStoryFile(caseId, endingStory);
  // 엔딩 스토리 표시
}
```

## 커스터마이징

### 새로운 스토리 추가

1. `cases/c001/stories/new_story.json` 생성
2. 이미지 파일을 `cases/c001/images/`에 추가
3. `flow.yaml`에서 트리거/엔딩에 연결

### 새로운 조건 타입 추가

1. `apps/api/src/types/story.types.ts`에 타입 정의
2. `apps/api/src/flow/flow-evaluator.service.ts`에 평가 로직 추가

### 새로운 액션 타입 추가

1. `apps/api/src/types/story.types.ts`에 타입 정의
2. `apps/api/src/flow/flow-evaluator.service.ts`에 실행 로직 추가

## 주의사항

- **이미지 경로**: 이미지 파일명만 지정 (경로 불필요)
- **YAML 문법**: 들여쓰기는 공백 2칸
- **트리거 중복 실행 방지**: 트리거는 한 번만 실행됨 (플래그로 관리)
- **조건 우선순위**: 엔딩은 배열 순서대로 평가 (첫 매칭)

## 디버깅

### 스토리 파일 검증
```bash
# Backend 로그 확인
pnpm dev:api

# 브라우저에서 직접 테스트
http://localhost:3001/story/c001/intro.json
http://localhost:3001/story/c001/flow
```

### Flow 조건 테스트
```typescript
// flow-evaluator.service.ts에서 로그 추가
console.log('Evaluating condition:', condition);
console.log('Game state:', gameState);
console.log('Result:', result);
```

## 추후 확장 가능성

- 오디오/BGM 지원
- 캐릭터 대화 UI (비주얼 노벨 스타일)
- 애니메이션 효과
- 선택지가 있는 인터랙티브 컷신
- 조건부 자막 분기
