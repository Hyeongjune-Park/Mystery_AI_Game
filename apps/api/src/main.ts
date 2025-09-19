// apps/api/src/main.ts
// ✅ CORS 허용 + PORT/HOST 환경변수 적용
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // 브라우저에서 웹(3000) → API(3001) 접근 허용
  app.enableCors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
      : ['http://localhost:3000'],
    credentials: true,
  });

  // 종료 시 provider들의 onModuleDestroy 호출 활성화
  app.enableShutdownHooks();

  const PORT = Number(process.env.PORT ?? 3001);
  const HOST = process.env.HOST ?? '0.0.0.0';
  await app.listen(PORT, HOST);
  // console.log(`API listening on http://${HOST}:${PORT}`);
}

void bootstrap();
