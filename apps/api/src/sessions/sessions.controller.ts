/**
 * Sessions Controller
 * 세션 관련 API 엔드포인트
 */

import { Controller, Post, Body, Param } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  /**
   * 세션 생성
   * POST /sessions
   */
  @Post()
  async createSession(@Body() body: { caseId?: string; playerId?: string }) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session = await this.sessions.getOrCreate(
      sessionId,
      body.caseId || 'c001',
    );
    return { sessionId: session.id, caseId: body.caseId || 'c001' };
  }

  /**
   * 증거 추가 (테스트용)
   * POST /sessions/:id/clues
   */
  @Post(':id/clues')
  async addClue(@Param('id') sessionId: string, @Body() body: { clueId: string }) {
    if (!body.clueId) {
      throw new Error('clueId is required');
    }

    await this.sessions.addClue(sessionId, body.clueId);

    return {
      success: true,
      message: `Clue "${body.clueId}" added to session ${sessionId}`,
    };
  }
}
