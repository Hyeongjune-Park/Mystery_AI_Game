/**
 * Flow Module
 * 게임 흐름 평가 및 관리 모듈
 */

import { Module } from '@nestjs/common';
import { FlowEvaluatorService } from './flow-evaluator.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FlowEvaluatorService],
  exports: [FlowEvaluatorService],
})
export class FlowModule {}
