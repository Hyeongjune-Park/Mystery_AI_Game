/**
 * Story and Flow File Loader
 * 스토리 파일과 Flow 파일을 로드하는 서비스
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { Story, FlowConfig } from '../types/story.types';

export class StoryLoader {
  private readonly casesBasePath: string;

  constructor() {
    // 프로젝트 루트의 cases 폴더 경로
    // dist 폴더에서 실행되므로 ../../../../.. 또는 절대경로 사용
    this.casesBasePath = path.resolve(__dirname, '../../../../..', 'cases');
    console.log('[StoryLoader] Cases base path:', this.casesBasePath);
  }

  /**
   * 특정 케이스의 스토리 파일을 로드합니다
   * @param caseId 케이스 ID (예: 'c001')
   * @param storyFileName 스토리 파일명 (예: 'intro.json')
   * @returns Story 객체
   */
  loadStory(caseId: string, storyFileName: string): Story {
    const storyPath = path.join(
      this.casesBasePath,
      caseId,
      'stories',
      storyFileName,
    );

    if (!fs.existsSync(storyPath)) {
      throw new Error(`Story file not found: ${storyPath}`);
    }

    const fileContent = fs.readFileSync(storyPath, 'utf-8');
    const story: Story = JSON.parse(fileContent);

    // 이미지 경로 검증
    this.validateStoryImages(caseId, story);

    return story;
  }

  /**
   * 특정 케이스의 flow.yaml 파일을 로드합니다
   * @param caseId 케이스 ID (예: 'c001')
   * @returns FlowConfig 객체
   */
  loadFlowConfig(caseId: string): FlowConfig {
    const flowPath = path.join(this.casesBasePath, caseId, 'flow.yaml');

    if (!fs.existsSync(flowPath)) {
      throw new Error(`Flow config file not found: ${flowPath}`);
    }

    const fileContent = fs.readFileSync(flowPath, 'utf-8');
    const flowConfig: FlowConfig = yaml.parse(fileContent);

    // Flow 설정 검증
    this.validateFlowConfig(caseId, flowConfig);

    return flowConfig;
  }

  /**
   * 케이스의 모든 스토리 파일 목록을 가져옵니다
   * @param caseId 케이스 ID
   * @returns 스토리 파일명 배열
   */
  listStories(caseId: string): string[] {
    const storiesDir = path.join(this.casesBasePath, caseId, 'stories');

    if (!fs.existsSync(storiesDir)) {
      return [];
    }

    return fs
      .readdirSync(storiesDir)
      .filter((file) => file.endsWith('.json'));
  }

  /**
   * 이미지 파일이 실제로 존재하는지 검증합니다 (선택적)
   * 개발 중에는 이미지가 없어도 동작하도록 경고만 출력
   */
  private validateStoryImages(caseId: string, story: Story): void {
    const imagesDir = path.join(this.casesBasePath, caseId, 'images');

    story.scenes.forEach((scene, index) => {
      const imagePath = path.join(imagesDir, scene.image);
      if (!fs.existsSync(imagePath)) {
        console.warn(
          `[StoryLoader] Image not found for story "${story.id}" scene ${index}: ${scene.image}`,
        );
      }
    });
  }

  /**
   * Flow 설정의 스토리 참조가 유효한지 검증합니다
   */
  private validateFlowConfig(caseId: string, flowConfig: FlowConfig): void {
    const stories = this.listStories(caseId);

    // 게임 시작 스토리 검증
    if (!stories.includes(flowConfig.gameStart.story)) {
      console.warn(
        `[StoryLoader] Game start story not found: ${flowConfig.gameStart.story}`,
      );
    }

    // 트리거의 cutscene 액션 검증
    flowConfig.triggers.forEach((trigger) => {
      this.validateTriggerAction(trigger.action, stories, trigger.id);
    });

    // 엔딩 스토리 검증
    flowConfig.endings.forEach((ending) => {
      if (!stories.includes(ending.story)) {
        console.warn(
          `[StoryLoader] Ending story not found for "${ending.id}": ${ending.story}`,
        );
      }
    });
  }

  /**
   * 트리거 액션의 스토리 참조를 검증합니다 (재귀적)
   */
  private validateTriggerAction(
    action: any,
    stories: string[],
    triggerId: string,
  ): void {
    if (action.type === 'cutscene') {
      if (!stories.includes(action.story)) {
        console.warn(
          `[StoryLoader] Cutscene story not found for trigger "${triggerId}": ${action.story}`,
        );
      }
    } else if (action.type === 'multiple') {
      action.actions.forEach((subAction: any) => {
        this.validateTriggerAction(subAction, stories, triggerId);
      });
    }
  }

  /**
   * 이미지 파일의 절대 경로를 반환합니다
   * @param caseId 케이스 ID
   * @param imageFileName 이미지 파일명
   * @returns 절대 경로
   */
  getImagePath(caseId: string, imageFileName: string): string {
    return path.join(this.casesBasePath, caseId, 'images', imageFileName);
  }

  /**
   * 이미지 URL을 생성합니다 (정적 파일 서빙용)
   * @param caseId 케이스 ID
   * @param imageFileName 이미지 파일명
   * @returns URL 경로
   */
  getImageUrl(caseId: string, imageFileName: string): string {
    return `/cases/${caseId}/images/${imageFileName}`;
  }
}

// 싱글톤 인스턴스 export
export const storyLoader = new StoryLoader();
