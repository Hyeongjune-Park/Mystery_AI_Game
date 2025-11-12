- dev all    : pnpm dev:all
- install    : pnpm install
- lint fix   : pnpm eslint . --ext .ts,.tsx --fix
- fmt all    : pnpm prettier --write .

prisma studio 실행
- pnpm -C apps/api exec npx prisma studio
