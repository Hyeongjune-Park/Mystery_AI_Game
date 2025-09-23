```md
# Dev Setup
- Node 22, pnpm 10
- pnpm-workspace.yaml: apps/*, packages/*
- turbo.json: "tasks" 사용
- Lockfile: 루트만 사용

## Run
pnpm install

pnpm -C apps/api prisma:gen
pnpm -C apps/api prisma:deploy

pnpm dev:all

## test link
http://localhost:3000/play/c001