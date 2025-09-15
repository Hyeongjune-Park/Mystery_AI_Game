// apps/api/test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http'; // ✅ 추가
import { AppModule } from '../src/app.module';

describe('App e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / -> 200', async () => {
    // ✅ any → http.Server 로 좁혀서 전달 (no-unsafe-argument 해결)
    const httpServer: Server = app.getHttpServer() as unknown as Server;
    await request(httpServer).get('/').expect(200).expect('Hello World!');
  });
});
