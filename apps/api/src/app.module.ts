// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SessionsController } from './sessions.controller';

@Module({
  controllers: [AppController, SessionsController],
})
export class AppModule {}
