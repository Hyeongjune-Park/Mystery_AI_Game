## Quick Start
```bash
pnpm install
pnpm dev:all
# web: http://localhost:3000  api: http://localhost:3001/health


Web: apps/web/.env.local → NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
Routes: POST /sessions, POST /sessions/:id/message (echo), GET /health
Dev page: http://localhost:3000/play/demo



