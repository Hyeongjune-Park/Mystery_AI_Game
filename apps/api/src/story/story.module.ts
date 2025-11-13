/**
 * Story Module
 * 스토리/컷신 시스템 모듈
 */

import { Module } from '@nestjs/common';
import { StoryController } from './story.controller';

@Module({
  controllers: [StoryController],
})
export class StoryModule {}
