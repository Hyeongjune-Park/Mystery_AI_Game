// 개발용 샘플 시드: 사건/NPC/단서
import * as path from 'node:path';
import * as fs from 'node:fs';
import { config as dotenv } from 'dotenv';
dotenv({ path: path.resolve(__dirname, '.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // c001 케이스 생성
  const c001 = await prisma.case.upsert({
    where: { code: 'c001' },
    update: {},
    create: {
      code: 'c001',
      title: '타워팰리스 살인사건',
      synopsis: '서울 강남구 타워팰리스에서 발생한 살인사건. 피해자는 김민수(45세).',
    },
  });

  console.log('✅ Case c001 created/updated');

  // npcs.json 로드
  const npcsPath = path.resolve(__dirname, '../../../cases/c001/npcs.json');
  const npcsData = JSON.parse(fs.readFileSync(npcsPath, 'utf-8'));

  // NPC 데이터 삽입
  for (const npc of npcsData) {
    await prisma.npcProfile.upsert({
      where: { id: npc.id },
      update: {
        name: npc.displayName,
        role: npc.role,
        personality: npc.personality,
        promptRules: {
          persona: npc.persona,
          knowledge: npc.knowledge,
          deception: npc.deception,
          lies: npc.lies || [],
          stateChanges: npc.stateChanges || [],
          hintBehavior: npc.hintBehavior || {},
        },
      },
      create: {
        id: npc.id,
        caseId: c001.id,
        name: npc.displayName,
        role: npc.role,
        personality: npc.personality,
        promptRules: {
          persona: npc.persona,
          knowledge: npc.knowledge,
          deception: npc.deception,
          lies: npc.lies || [],
          stateChanges: npc.stateChanges || [],
          hintBehavior: npc.hintBehavior || {},
        },
      },
    });
    console.log(`✅ NPC ${npc.id} (${npc.displayName}) created/updated`);
  }

  // clues.json 로드 및 삽입
  const cluesPath = path.resolve(__dirname, '../../../cases/c001/clues.json');
  const cluesData = JSON.parse(fs.readFileSync(cluesPath, 'utf-8'));

  for (const clue of cluesData) {
    await prisma.clue.upsert({
      where: { code: clue.code },
      update: {
        type: clue.type,
        payload: {
          title: clue.title,
          description: clue.description,
          tier: clue.tier,
          importance: clue.importance,
          solution_critical: clue.solution_critical,
          autoReveal: clue.autoReveal,
          revealCondition: clue.revealCondition,
          supports: clue.supports || [],
          contradicts: clue.contradicts || [],
        },
      },
      create: {
        code: clue.code,
        caseId: c001.id,
        type: clue.type,
        payload: {
          title: clue.title,
          description: clue.description,
          tier: clue.tier,
          importance: clue.importance,
          solution_critical: clue.solution_critical,
          autoReveal: clue.autoReveal,
          revealCondition: clue.revealCondition,
          supports: clue.supports || [],
          contradicts: clue.contradicts || [],
        },
        revealIf: [],
      },
    });
    console.log(`✅ Clue ${clue.code} (${clue.title}) created/updated`);
  }

  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
