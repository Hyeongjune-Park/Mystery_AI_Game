import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // 종료 시 provider들의 onModuleDestroy 호출 활성화
  app.enableShutdownHooks();

  await app.listen(3001);
}

// 톱레벨 Promise 대기하지 않음을 명시(ESLint no-floating-promises 대응)
void bootstrap();
