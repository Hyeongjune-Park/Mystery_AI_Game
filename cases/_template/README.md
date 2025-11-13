# 새 케이스 추가 가이드

이 템플릿을 사용하여 새로운 추리 게임을 쉽게 추가할 수 있습니다.

## 🚀 빠른 시작

### 1단계: 템플릿 복사
```bash
# cases 디렉토리에서
cp -r _template c002  # c002를 원하는 케이스 ID로 변경
cd c002
```

### 2단계: YAML 파일 수정
각 파일을 열어서 내용을 수정하세요:

- `case.yaml` - 기본 정보 (제목, 시놉시스, 난이도)
- `story.yaml` - 인트로 스토리 페이지들
- `npcs-intro.yaml` - NPC 소개 정보
- `locations.yaml` - 장소 정보
- `npcs.json` - NPC 상세 정보 (AI 대화용)
- `clues.json` - 단서 정보

### 3단계: 검증 (선택사항)
```bash
pnpm validate:case c002
```

### 4단계: 실행
```bash
pnpm dev
```

브라우저에서 `http://localhost:3000/play/c002` 접속

---

## 📁 파일 설명

### `case.yaml`
케이스의 기본 정보를 정의합니다.

```yaml
id: c002  # 케이스 고유 ID
title: 게임 제목
subtitle: 영문 부제
synopsis: 게임 요약 설명
difficulty: normal  # easy, normal, hard
estimatedMinutes: 30

screenFlow:
  - intro      # 게임 인트로 화면
  - story      # 스토리 화면
  - npcs       # NPC 소개 화면
  - locations  # 장소 소개 화면
  - game       # 메인 게임 화면
```

### `story.yaml`
인트로 스토리 페이지들을 정의합니다.

```yaml
pages:
  - title: 첫 번째 페이지 제목
    content: |
      여러 줄의 텍스트를
      자유롭게 작성할 수 있습니다.

      빈 줄도 포함할 수 있습니다.

  - title: 두 번째 페이지 제목
    content: |
      계속해서 페이지를 추가하세요.

skippable: true  # 스토리 건너뛰기 허용 여부
```

### `npcs-intro.yaml`
NPC 소개 화면 정보를 정의합니다.

```yaml
intro:
  title: 주요 인물 소개
  description: 설명 텍스트
  tips:
    - 팁 1
    - 팁 2

npcs:
  - id: npc.detective.someone
    name: 이름
    age: 나이
    role: 역할
    description: 설명
    specialty: 특기/직업
```

### `locations.yaml`
장소 정보를 정의합니다.

```yaml
intro:
  title: 주요 장소 안내
  description: 설명 텍스트
  tips:
    - 팁 1
    - 팁 2

locations:
  - id: location.somewhere
    name: 장소 이름
    floor: 1층
    description: 장소 설명
    objects:
      # 오브젝트는 4가지 요소로 구성:
      - id: obj.something          # 오브젝트 고유 ID
        name: 오브젝트 이름         # UI에 표시될 이름
        description: |             # 클릭 시 보여질 상세 설명
          상세한 설명을 작성하세요.
          여러 줄 가능합니다.
        hiddenClue: 플레이어가 발견해야 할 핵심 단서  # 숨겨진 단서
        image: null                # 이미지 경로 (선택사항)
```

**오브젝트 설명**:
- `id`: 고유 식별자 (obj.으로 시작)
- `name`: 플레이어에게 보이는 이름
- `description`: 오브젝트를 조사했을 때 표시될 상세 정보
- `hiddenClue`: 플레이어가 추리를 통해 발견해야 할 핵심 단서 (점수/엔딩에 영향)
- `image`: 추후 이미지 경로 (현재는 null)

### `npcs.json`
NPC의 상세 정보 (AI 대화용). 기존 `cases/c001/npcs.json` 참고.

### `clues.json`
게임 내 단서 정보. 기존 `cases/c001/clues.json` 참고.

---

## ✅ 체크리스트

새 케이스를 만들 때 다음을 확인하세요:

- [ ] 케이스 ID가 고유한가? (다른 케이스와 중복되지 않음)
- [ ] 모든 YAML 파일의 문법이 올바른가?
- [ ] NPC ID와 장소 ID가 `npcs.json`, `clues.json`과 일치하는가?
- [ ] 스토리 페이지가 최소 1개 이상인가?
- [ ] NPC가 최소 1명 이상인가?
- [ ] 장소가 최소 1개 이상인가?

---

## 💡 팁

### YAML 작성 팁
- 들여쓰기는 스페이스 2칸 사용 (탭 X)
- 콜론(`:`) 뒤에는 반드시 공백 필요
- 여러 줄 텍스트는 `|` 사용
- 주석은 `#`으로 시작

### 좋은 스토리 작성 팁
- 첫 페이지: 사건 발생 상황
- 중간 페이지: 의문점, 배경 설명
- 마지막 페이지: 플레이어의 목표 제시

### NPC 설계 팁
- 다양한 역할 분배 (용의자, 증인, 조력자 등)
- 각 NPC마다 알고 있는 정보 차별화
- 일부 NPC는 거짓말하게 설정 가능

---

## 🔧 문제 해결

### YAML 파싱 에러
- YAML 검증기 사용: https://www.yamllint.com/
- 들여쓰기 확인 (스페이스 2칸)
- 특수문자 확인 (`:`, `-`, `|`)

### 게임이 로드되지 않음
- 케이스 ID 확인
- API 서버 재시작: `pnpm dev:api`
- 브라우저 콘솔 확인

---

더 자세한 정보는 프로젝트 루트의 `CLAUDE.md` 파일을 참고하세요.
