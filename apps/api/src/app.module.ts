// apps/api/src/app.module.ts
// ✅ API 라우트를 실제로 앱에 연결한다.
import { Module } from '@nestjs/common';

// 기본 헬스체크/에코
import { AppController } from './app.controller';
import { AppService } from './app.service';

// 대화 라우트(/sessions/:id/message)
import { MessagesModule } from './messages/messages.module';

// Prisma (DI)
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule, // Prisma DI (현재는 미사용이지만 전역 제공)
    MessagesModule, // ✅ /sessions/:id/message 라우트 활성화
  ],
  controllers: [
    AppController, // ✅ /health, /echo 활성화
  ],
  providers: [AppService],
})
export class AppModule {}
