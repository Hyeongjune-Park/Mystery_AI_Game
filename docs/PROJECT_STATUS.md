# Mystery Platform — Project Status & Playbook
_Last updated: 2025-09-21 (Asia/Seoul)_

본 문서는 **현재까지 진행 상황**, **재현 가능한 실행 방법**, **DB/Prisma 운영 규칙**, **트러블슈팅**, **다음 작업 계획**을 한곳에 모은 운영 가이드입니다.

---

## 1) TL;DR (요약)
- **상태**: 로컬 개발 환경에서 `pnpm dev:all` 정상 구동 ✅  
- **핵심 이슈 해결**: Prisma의 `DATABASE_URL` 경로 혼동으로 생기던 `apps/api/prisma/prisma/dev.db` 중첩 문제 해결  
  - 해결책: `main.ts`에서 `apps/api/prisma/.env` 명시 로드, `apps/api/.env`의 `DATABASE_URL` 제거
- **다음 단계 핵심**: `SessionsService`를 Prisma 기반 영속화로 전환, 시드 안정화, 인덱스 보강, 문서 정리

---

## 2) 현재 구조 (요약 트리)
apps/
    api/
        prisma/
            migrations/ # 커밋됨 (재현성 핵심)
            dev.db # 커밋 금지 (로컬 DB)
            schema.prisma # 커밋됨
            .env # 커밋 금지 (CLI용 DATABASE_URL=file:./dev.db)
            seed.ts # 시드 스크립트
        src/
            prisma/ # PrismaModule/Service (빌드 대상)
            ai/ # LLM/툴/프롬프트/검증
            messages/ # POST /sessions/:id/message
            sessions/ # SessionsService (DB 연동 예정)
            app.controller.ts # GET /health
            main.ts # prisma/.env 명시 로드 + CORS
    web/
        src/ # 프런트엔드
    docs/
        PROJECT_STATUS.md # 본 문서

## 3) 실행 재현 절차 (새 기기 기준)
> Windows PowerShell 기준. macOS/Linux도 동일 개념.
```powershell
git clone <repo-url>
cd mystery_platform
pnpm install

# 환경파일 복사 및 값 설정
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.local.example apps\web\.env.local
# apps/api/.env: OPENAI_API_KEY=sk-...
# apps/web/.env.local: NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Prisma 스키마/마이그레이션 반영
pnpm -C apps/api prisma:gen
pnpm -C apps/api prisma:deploy

# (선택) 시드
pnpm -C apps/api exec ts-node prisma/seed.ts

# 실행
pnpm dev:all
# API: http://localhost:3001/health -> {"status":"ok"}
# Web: http://localhost:3000/play/c001