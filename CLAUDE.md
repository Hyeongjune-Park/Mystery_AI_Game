# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mystery Platform is an AI-powered interactive mystery game platform where players investigate cases by conversing with NPCs powered by OpenAI's LLM. The system features:

- **Monorepo Architecture**: pnpm workspace with Turbo build orchestration
- **Backend**: NestJS 11 API with Prisma ORM (SQLite) for session/message persistence
- **Frontend**: Next.js 15 (React 19) with Tailwind CSS
- **AI Integration**: OpenAI SDK (GPT-4o-mini) for dynamic NPC conversations with structured response validation
- **Case System**: JSON-based scenario loading with NPCs, clues, and conditional story progression

## Development Commands

### Quick Start
```bash
pnpm install
pnpm -C apps/api prisma:gen       # Generate Prisma client
pnpm -C apps/api prisma:deploy    # Apply migrations
pnpm dev:all                      # Start both API (3001) and Web (3000)
```

**Important**: `dev:all` uses `wait-on tcp:3001` to ensure the API starts before the Web server.

### Common Workflows

#### Running Individual Apps
```bash
pnpm dev:api    # API only on :3001
pnpm dev:web    # Web only on :3000
```

#### Testing
```bash
pnpm -C apps/api test          # Run Jest unit tests
pnpm -C apps/api test:watch    # Watch mode for TDD
pnpm -C apps/api test:cov      # Coverage report
pnpm -C apps/api test:e2e      # End-to-end tests
```

#### Database Operations
```bash
pnpm -C apps/api prisma:dev      # Create migration (dev mode)
pnpm -C apps/api db:seed         # Run seed script
pnpm -C apps/api prisma:gen      # Regenerate Prisma client after schema changes
```

#### Code Quality
```bash
pnpm lint                    # ESLint all packages (Turbo)
pnpm typecheck              # TypeScript validation (Turbo)
pnpm build                  # Build all apps (Turbo)
```

### Running Single Tests
```bash
cd apps/api
pnpm test -- <test-file-path>               # Run specific test file
pnpm test -- --testNamePattern="<pattern>"  # Run tests matching pattern
```

## Architecture

### Monorepo Structure
```
apps/
  api/                  # NestJS backend (port 3001)
    src/
      ai/              # LLM integration (OpenAI tools, prompts, validation)
      messages/        # POST /sessions/:id/message controller
      sessions/        # Session CRUD service (Prisma-based)
      prisma/          # PrismaModule/Service for DI
      app.controller.ts # GET /health
      main.ts         # Bootstrap (loads prisma/.env for DATABASE_URL)
    prisma/
      schema.prisma   # Database schema (7 models)
      migrations/     # Committed migration files
      dev.db          # Local SQLite (gitignored)
      .env            # DATABASE_URL=file:./dev.db (gitignored)
      seed.ts         # Database seeding logic
  web/                # Next.js frontend (port 3000)
    src/
      app/
        api/proxy/[...path]/ # Proxy to backend API
        play/[caseId]/       # Main game UI (ClientPlay, ChoiceBar, TimelinePanel)
      lib/api.ts      # API client (sendMessage, fetchTimeline)
cases/c001/           # Case scenario data (JSON files)
docs/                 # Project documentation
```

### Database Schema (Prisma + SQLite)

**7 Models**: Case, NpcProfile, Session, Message, Clue, StateSnapshot

**Critical Details**:
- **Message Model**: Has index `@@index([sessionId, createdAt])` for efficient timeline queries
- **payloadJson**: Stores full validated LLM response (NpcReplyV1 schema)
- **Session.flags**: JSON field for game state management
- **CASCADE**: Messages are deleted when Session is deleted

**DATABASE_URL Location**:
- **`apps/api/prisma/.env`** contains `DATABASE_URL=file:./dev.db` (Prisma CLI uses this)
- **DO NOT** put DATABASE_URL in `apps/api/.env` (caused historical path duplication bug)
- `main.ts` explicitly loads `prisma/.env` using dotenv

### API Endpoints

```
GET  /health                      # Health check
POST /sessions                    # Create session (body: {caseId, playerId?})
POST /sessions/:id/message        # Send message, get NPC reply + choices
                                  # (body: {caseId, npcId, text})
GET  /sessions/:id/timeline       # Fetch conversation history (query: limit=100)
```

### Frontend-Backend Communication

- **Frontend** runs Next.js on `localhost:3000`
- **Backend** runs NestJS on `localhost:3001`
- **Proxy**: `/api/proxy/*` routes in Next.js forward to backend
- **Environment**: `apps/web/.env.local` sets `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001`
- **CORS**: Enabled in `main.ts` for localhost:3000

### AI/LLM Architecture

**Located in `apps/api/src/ai/`**:

1. **prompts.ts**: System/user prompt templates for NPC behavior
2. **openai.tools.ts**: OpenAI function calling tool definitions
3. **schema.ts**: Zod schemas for validating LLM responses (NpcReplyV1, EndgameChoicesV1)
4. **validate.ts**: Validation logic using AJV (JSON Schema) + Zod
5. **context-builder.ts**: Builds conversation history from Message[] for LLM context
6. **choices.ts**: Generates dramatic endgame choices using structured outputs
7. **cache.ts**: LLM response caching to reduce API costs

**Response Flow**:
OpenAI → Raw JSON → Zod/AJV validation → Extract (reply, state, choices) → Save to Message.payloadJson

### Case Data System

**Structure** (`cases/c001/`):
- `case.meta.json`: Title, synopsis, metadata
- `npcs.json`: NPC profiles (name, role, personality, promptRules)
- `clues.json`: Evidence/clue definitions with reveal conditions
- `states.json`: Game state definitions
- `gather_clues.system.md`: System prompts for clue gathering phase

Cases are loaded in-memory by `apps/api/src/cases/memory.ts` and seeded into DB via Prisma.

## Development Guidelines

### Git Workflow

**Branch Strategy**:
- `main` - Production-ready branch
- `develop` - Active development branch (current working branch)
- `feat-*` / `fix-*` - Feature/fix branches

**Commit Convention** (Conventional Commits enforced by commitlint):
```
<type>(<scope>): <summary>

[optional body]
```

**Types**: feat, fix, chore, refactor, test, docs, ci, build, perf

**Scopes**:
- `api` - Backend changes (apps/api)
- `web` - Frontend changes (apps/web)
- `repo` - Monorepo config/CI/CD
- `infra` - Database/deployment
- `case-xxx` - Scenario data

**Git Hooks** (Husky):
- Pre-commit: ESLint auto-fix, Prettier format, typecheck
- Commit-msg: Commitlint validation

### Environment Setup

**Required `.env` files** (use `.example` templates):

1. **`apps/api/prisma/.env`** (Prisma CLI):
   ```
   DATABASE_URL="file:./dev.db"
   ```

2. **`apps/api/.env`** (NestJS runtime - do NOT include DATABASE_URL here):
   ```
   OPENAI_API_KEY=sk-...
   ```

3. **`apps/web/.env.local`** (Next.js):
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
   ```

### TypeScript Configuration

- **API**: `apps/api/tsconfig.json` (ES2023, decorators enabled, path aliases)
- **Web**: `apps/web/tsconfig.json` (ES2017, path alias `@/*` → `src/*`)
- Always run `pnpm typecheck` before committing

### Prisma Migration Workflow

**When changing schema**:
```bash
# 1. Edit apps/api/prisma/schema.prisma
# 2. Create migration
pnpm -C apps/api prisma:dev
# 3. Regenerate client
pnpm -C apps/api prisma:gen
# 4. Update seed script if needed (prisma/seed.ts)
# 5. Commit: schema.prisma + migrations/ folder
```

**Important**:
- `dev.db` is gitignored (local only)
- `migrations/` folder is committed (ensures reproducibility)
- Run `prisma:gen` after every schema change to update Prisma Client types

### Code Organization Patterns

1. **NestJS Modules**: Each feature has a dedicated module (MessagesModule, SessionsModule, PrismaModule)
2. **Dependency Injection**: Use NestJS @Injectable() for services, inject PrismaService for DB access
3. **Validation**: Use class-validator DTOs for API request validation
4. **AI Layer Separation**: All LLM logic isolated in `src/ai/` - never mix OpenAI calls directly into controllers
5. **Frontend State**: Use React hooks for local state, API polling for server updates (TimelinePanel)

### Testing Strategy

- **Unit Tests**: `*.spec.ts` files alongside source code
- **E2E Tests**: `test/*.e2e-spec.ts` with separate Jest config
- **Coverage Target**: Aim for >80% on critical paths (AI validation, session logic)
- **Mocking**: Mock Prisma service in tests using `jest.mock()`

## Key Files to Know

| File | Purpose |
|------|---------|
| `turbo.json` | Turbo build pipeline config (caching, task dependencies) |
| `pnpm-workspace.yaml` | Workspace package definitions |
| `apps/api/src/main.ts` | NestJS bootstrap, CORS, env loading |
| `apps/api/prisma/schema.prisma` | Single source of truth for database schema |
| `apps/web/src/app/api/proxy/[...path]/route.ts` | API proxy to backend |
| `apps/web/src/lib/api.ts` | Frontend API client functions |
| `apps/api/src/ai/schema.ts` | Zod schemas for LLM response validation |
| `docs/PROJECT_STATUS.md` | Current development status and troubleshooting (Korean) |

## Common Issues & Solutions

### Database Path Duplication
**Symptom**: `apps/api/prisma/prisma/dev.db` created instead of `apps/api/prisma/dev.db`

**Fix**: Ensure `DATABASE_URL` is ONLY in `apps/api/prisma/.env`, NOT in `apps/api/.env`. The `main.ts` explicitly loads `prisma/.env`.

### Prisma Client Not Found
**Symptom**: `Cannot find module '@prisma/client'`

**Fix**: Run `pnpm -C apps/api prisma:gen` to generate client after schema changes.

### API Not Responding on :3001
**Check**:
1. Verify `apps/api/.env` has `OPENAI_API_KEY`
2. Run `pnpm -C apps/api prisma:deploy` to apply migrations
3. Check logs for port conflicts

### Frontend API Calls Failing
**Check**:
1. `apps/web/.env.local` has correct `NEXT_PUBLIC_API_BASE_URL`
2. CORS is enabled in `apps/api/src/main.ts` (should allow localhost:3000)
3. API proxy route exists at `/api/proxy/[...path]`

## Test Endpoints

After running `pnpm dev:all`:

```bash
# Health check
curl http://localhost:3001/health

# Visit game page
open http://localhost:3000/play/c001
```

## Documentation

Key docs in `docs/`:
- **PROJECT_STATUS.md**: Current status, troubleshooting, next steps (Korean)
- **WORKFLOW.md**: Git workflow, commit conventions, PR process
- **GDD.md**: Game design document
- **NARRATIVE_RULES.md**: Story/narrative rules for LLM prompts
- **CONVERSATION_SCHEMA.md**: Message schema documentation
- **UI_WIREFRAME.md**: UI design specs
