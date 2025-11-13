/**
 * Story Controller
 * 스토리/컷신 관련 API 엔드포인트
 */

import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { storyLoader } from '../cases/story.loader';
import * as fs from 'fs';

@Controller('story')
export class StoryController {
  /**
   * 특정 케이스의 flow.yaml 설정을 조회합니다
   * GET /story/:caseId/flow
   * 주의: 이 라우트는 :caseId/:storyFileName 보다 먼저 선언되어야 함
   */
  @Get(':caseId/flow')
  getFlowConfig(@Param('caseId') caseId: string) {
    try {
      return storyLoader.loadFlowConfig(caseId);
    } catch (error) {
      throw new Error(`Failed to load flow config: ${error.message}`);
    }
  }

  /**
   * 특정 케이스의 모든 스토리 목록을 조회합니다
   * GET /story/:caseId/list
   */
  @Get(':caseId/list')
  listStories(@Param('caseId') caseId: string) {
    try {
      const stories = storyLoader.listStories(caseId);
      return { stories };
    } catch (error) {
      throw new Error(`Failed to list stories: ${error.message}`);
    }
  }

  /**
   * 이미지 파일을 서빙합니다
   * GET /story/:caseId/image/:imageFileName
   */
  @Get(':caseId/image/:imageFileName')
  getImage(
    @Param('caseId') caseId: string,
    @Param('imageFileName') imageFileName: string,
    @Res() res: Response,
  ) {
    try {
      const imagePath = storyLoader.getImagePath(caseId, imageFileName);

      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ error: 'Image not found' });
      }

      // MIME type 설정
      const ext = imageFileName.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
      };

      const mimeType = mimeTypes[ext || ''] || 'application/octet-stream';
      res.setHeader('Content-Type', mimeType);

      const imageBuffer = fs.readFileSync(imagePath);
      return res.send(imageBuffer);
    } catch (error) {
      return res
        .status(500)
        .json({ error: `Failed to serve image: ${error.message}` });
    }
  }

  /**
   * 특정 케이스의 스토리 파일을 조회합니다
   * GET /story/:caseId/:storyFileName
   * 주의: 이 라우트는 가장 마지막에 선언되어야 함 (catch-all 역할)
   */
  @Get(':caseId/:storyFileName')
  getStory(
    @Param('caseId') caseId: string,
    @Param('storyFileName') storyFileName: string,
  ) {
    try {
      const story = storyLoader.loadStory(caseId, storyFileName);

      // 이미지 경로를 URL로 변환
      const storyWithUrls = {
        ...story,
        scenes: story.scenes.map((scene) => ({
          ...scene,
          imageUrl: storyLoader.getImageUrl(caseId, scene.image),
        })),
      };

      return storyWithUrls;
    } catch (error) {
      throw new Error(`Failed to load story: ${error.message}`);
    }
  }
}
