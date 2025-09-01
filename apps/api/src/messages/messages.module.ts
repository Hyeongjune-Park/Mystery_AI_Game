/**
 * apps/api/src/messages/messages.module.ts
 */
import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { SessionsService } from '../sessions/sessions.service';

@Module({
  controllers: [MessagesController],
  providers: [SessionsService],
})
export class MessagesModule {}
