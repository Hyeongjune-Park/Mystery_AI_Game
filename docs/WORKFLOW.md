# Engineering Workflow (Mystery Platform)

## Branching
- main/develop/feat-* 역할
- 네이밍 규칙: feat|fix|chore|refactor|docs|test|perf|build|ci

## Commit Rules
- Conventional Commits 형식 + 예시
- 원자 커밋 쪼개기 기준 (설정/DB/엔드포인트/UI 분리)

## Pull Request
- 템플릿 사용법
- CI 통과 필수 항목(lint/typecheck/test/build)
- Squash & Merge 권장, 릴리즈 플로우

## Release
- SemVer 태그 예: v0.3.0
- Release Drafter 사용법(선택)
- 핫픽스 → main → develop 체리픽 루틴

## Daily Routine
1) 이슈 작성 (요약/수용기준)
2) feat 브랜치 생성
3) 작은 커밋
4) PR 열고 자가 리뷰(스크린샷/로그)
5) CI 확인 후 머지
6) 릴리즈/태그 업데이트(필요 시)

## 커밋 메시지 구조
<type>(<scope>): <short summary>
<BLANK LINE>
[선택] 상세 설명 (무엇을/왜 했는지)
[선택] 관련 이슈나 참고: Closes #123

## 커밋 성격
type	용도 예시
feat	새로운 기능 추가
fix	버그 수정
chore	설정/빌드/의존성 관리(코드 로직 변화 없음)
refactor	기능 변화는 없지만 코드 구조 개선
test	테스트 코드 관련 (추가/수정/리팩터링)
docs	문서 작성/수정 (README, 주석 등)
ci	CI/CD 파이프라인 관련 (GitHub Actions 등)
build	빌드 시스템/의존성 변경 (turbo, webpack, pnpm 등)
perf	성능 개선 관련

## scope (영향 범위 구체화)
api: NestJS 백엔드 (apps/api)
web: NextJS 프론트 (apps/web)
repo: 루트 레벨, 모노레포 설정/CI/CD
infra: 배포 환경/데이터베이스/서버 세팅
case-xxx: 특정 시나리오/사건 데이터 작업
