/**
 * apps/api/src/sessions/sessions.service.ts
 * - 매우 단순한 인메모리 세션 저장소 (동기)
 */
import { Injectable } from '@nestjs/common';

type Log = { from: 'player' | 'npc'; text: string };
type Session = {
  id: string;
  state?: { node: string; flags: string[] };
  logs: Log[];
};

@Injectable()
export class SessionsService {
  private store = new Map<string, Session>();

  getOrCreate(id: string): Session {
    if (!this.store.has(id)) this.store.set(id, { id, logs: [] });
    return this.store.get(id)!;
  }

  append(id: string, log: Log): void {
    const s = this.getOrCreate(id);
    s.logs.push(log);
  }

  setState(id: string, state: { node: string; flags: string[] }): void {
    const s = this.getOrCreate(id);
    s.state = state;
  }
}
