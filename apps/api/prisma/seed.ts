// 개발용 샘플 시드: 사건/NPC/단서
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const c001 = await prisma.case.upsert({
    where: { code: 'c001' },
    update: {},
    create: {
      code: 'c001',
      title: '사라진 브로치 사건',
      synopsis: '저택 파티 중 브로치가 사라졌다. 용의자는 3명.',
    },
  });

  await prisma.npcProfile.upsert({
    where: { id: 'seed-npc-1' },
    update: {},
    create: {
      id: 'seed-npc-1',
      caseId: c001.id,
      name: '한서린',
      role: 'witness',
      personality: { tone: '차분', taboo: ['욕설'] },
      promptRules: { reveal_on: ['ask:브로치', 'flag:met_serin'] },
    },
  });

  await prisma.npcProfile.upsert({
    where: { id: 'seed-npc-2' },
    update: {},
    create: {
      id: 'seed-npc-2',
      caseId: c001.id,
      name: '최도윤',
      role: 'suspect',
      personality: { tone: '냉소', taboo: [] },
      promptRules: { reveal_on: ['flag:pressure', 'ask:알리바이'] },
    },
  });

  await prisma.clue.upsert({
    where: { code: 'c001-note' },
    update: {},
    create: {
      code: 'c001-note',
      caseId: c001.id,
      type: 'text',
      payload: { text: '정원 문 근처에서 발견된 노트 조각' },
      revealIf: [{ anyOf: ['ask:정원', 'flag:met_serin'] }],
    },
  });

  console.log('Seed done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
