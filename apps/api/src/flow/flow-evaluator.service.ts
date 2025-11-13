/**
 * Flow Evaluator Service
 * Flow 조건을 평가하고 트리거를 실행하는 서비스
 */

import { Injectable } from '@nestjs/common';
import {
  FlowConfig,
  TriggerCondition,
  TriggerAction,
  FlowTrigger,
} from '../types/story.types';
import { PrismaService } from '../prisma/prisma.service';

interface GameState {
  sessionId: string;
  caseId: string;
  discoveredClues: string[]; // 발견한 증거 ID 목록
  interrogatedNpcs: Map<string, number>; // NPC ID -> 대화 횟수
  flags: Record<string, any>; // 게임 플래그
  startTime: Date; // 게임 시작 시간
  lastProgressTime: Date; // 마지막 진행 시간
}

@Injectable()
export class FlowEvaluatorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 현재 게임 상태를 데이터베이스에서 로드합니다
   */
  async loadGameState(sessionId: string): Promise<GameState> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        messages: true,
      },
    });

    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // NPC별 대화 횟수 계산
    const interrogatedNpcs = new Map<string, number>();
    session.messages.forEach((msg) => {
      if (msg.role === 'user') {
        // 사용자가 보낸 메시지로 NPC 식별
        // npcName을 임시로 사용 (추후 npcId 필드 추가 필요)
        const npcId = msg.npcName || 'unknown';
        interrogatedNpcs.set(npcId, (interrogatedNpcs.get(npcId) || 0) + 1);
      }
    });

    // 발견된 증거 ID 목록 (flags에서 추출 또는 별도 테이블 조회)
    const flags = (session.flags as Record<string, any>) || {};
    const discoveredClues = (flags.discoveredClues as string[]) || [];

    return {
      sessionId,
      caseId: session.caseId,
      discoveredClues,
      interrogatedNpcs,
      flags,
      startTime: session.createdAt,
      lastProgressTime: new Date(), // 실제로는 마지막 메시지 시간
    };
  }

  /**
   * 조건을 평가합니다
   */
  evaluateCondition(
    condition: TriggerCondition,
    gameState: GameState,
  ): boolean {
    switch (condition.type) {
      case 'clue_discovered':
        return gameState.discoveredClues.includes(condition.clueId);

      case 'clues_discovered':
        if (condition.operator === 'all') {
          return condition.clueIds.every((id) =>
            gameState.discoveredClues.includes(id),
          );
        } else {
          return condition.clueIds.some((id) =>
            gameState.discoveredClues.includes(id),
          );
        }

      case 'npc_interrogated': {
        const count = gameState.interrogatedNpcs.get(condition.npcId) || 0;
        const minMessages = condition.minMessages || 1;
        return count >= minMessages;
      }

      case 'time_elapsed': {
        const elapsedMinutes =
          (new Date().getTime() - gameState.startTime.getTime()) / 1000 / 60;
        return elapsedMinutes >= condition.minutes;
      }

      case 'no_progress': {
        const idleMinutes =
          (new Date().getTime() - gameState.lastProgressTime.getTime()) /
          1000 /
          60;
        return idleMinutes >= condition.minutes;
      }

      case 'flag_check':
        return gameState.flags[condition.flag] === condition.value;

      case 'all':
        return condition.conditions.every((c) =>
          this.evaluateCondition(c, gameState),
        );

      case 'any':
        return condition.conditions.some((c) =>
          this.evaluateCondition(c, gameState),
        );

      case 'default':
        return true;

      default:
        console.warn(`Unknown condition type: ${(condition as any).type}`);
        return false;
    }
  }

  /**
   * 트리거를 평가하고 실행할 액션을 반환합니다
   */
  async evaluateTriggers(
    flowConfig: FlowConfig,
    gameState: GameState,
  ): Promise<TriggerAction[]> {
    const actionsToExecute: TriggerAction[] = [];

    for (const trigger of flowConfig.triggers) {
      if (this.evaluateCondition(trigger.condition, gameState)) {
        // 이미 실행된 트리거인지 확인 (중복 실행 방지)
        const triggerKey = `trigger_executed_${trigger.id}`;
        if (!gameState.flags[triggerKey]) {
          actionsToExecute.push(trigger.action);
          // 플래그 설정 (실제로는 DB에 저장 필요)
          gameState.flags[triggerKey] = true;
        }
      }
    }

    return actionsToExecute;
  }

  /**
   * 엔딩 조건을 평가하고 매칭되는 엔딩을 반환합니다
   */
  async evaluateEnding(
    flowConfig: FlowConfig,
    gameState: GameState,
  ): Promise<string | null> {
    // 엔딩 우선순위대로 평가 (첫 번째 매칭)
    for (const ending of flowConfig.endings) {
      if (this.evaluateCondition(ending.condition, gameState)) {
        return ending.story;
      }
    }

    return null;
  }

  /**
   * 액션을 실행하고 결과를 반환합니다
   */
  async executeAction(
    action: TriggerAction,
    sessionId: string,
  ): Promise<any> {
    switch (action.type) {
      case 'cutscene':
        return { type: 'cutscene', story: action.story };

      case 'phase_change':
        // 세션의 페이즈를 변경
        await this.prisma.session.update({
          where: { id: sessionId },
          data: {
            flags: {
              // Prisma JSON 업데이트
              phase: action.nextPhase,
            },
          },
        });
        return { type: 'phase_change', nextPhase: action.nextPhase };

      case 'flag_set':
        // 플래그 설정
        const session = await this.prisma.session.findUnique({
          where: { id: sessionId },
        });
        const currentFlags = (session?.flags as Record<string, any>) || {};
        await this.prisma.session.update({
          where: { id: sessionId },
          data: {
            flags: {
              ...currentFlags,
              [action.flag]: action.value,
            },
          },
        });
        return { type: 'flag_set', flag: action.flag, value: action.value };

      case 'hint':
        return { type: 'hint', message: action.message };

      case 'notification':
        return {
          type: 'notification',
          message: action.message,
          unlockClue: action.unlockClue,
        };

      case 'unlock_clue':
        // 증거 해금 (실제로는 Clue 레코드 생성)
        return { type: 'unlock_clue', clueId: action.clueId };

      case 'multiple':
        // 여러 액션 순차 실행
        const results: any[] = [];
        for (const subAction of action.actions) {
          const result = await this.executeAction(subAction, sessionId);
          results.push(result);
        }
        return { type: 'multiple', results };

      default:
        console.warn(`Unknown action type: ${(action as any).type}`);
        return null;
    }
  }
}
