// apps/api/src/sessions.controller.ts
import { Body, Controller, Param, Post } from '@nestjs/common';

class CreateSessionDto {
  userId!: string;
  caseId!: string;
}
class SendMessageDto {
  text!: string;
}

const mem = new Map<
  string,
  { id: string; messages: { speaker: 'PLAYER' | 'NPC'; text: string }[] }
>();

@Controller('sessions')
export class SessionsController {
  @Post()
  create(@Body() _dto: CreateSessionDto) {
    const id = crypto.randomUUID();
    mem.set(id, { id, messages: [] });
    return { id };
  }

  @Post(':id/message')
  send(@Param('id') id: string, @Body() dto: SendMessageDto) {
    const s = mem.get(id);
    if (!s) return { error: 'NO_SESSION' };
    s.messages.push({ speaker: 'PLAYER', text: dto.text });
    const reply = `echo: ${dto.text}`;
    s.messages.push({ speaker: 'NPC', text: reply });
    return {
      intent: 'answer',
      npc_tone: 'neutral',
      facts_used: [],
      npc_reply: reply,
    };
  }
}
