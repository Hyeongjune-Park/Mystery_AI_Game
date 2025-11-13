/**
 * apps/api/src/cases/yaml-loader.service.ts
 * YAML 기반 케이스 데이터 로더
 */

import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface StoryPage {
  title: string;
  content: string;
}

export interface StoryData {
  pages: StoryPage[];
  skippable: boolean;
}

export interface LocationObject {
  id: string;
  name: string;
  description: string;
  hiddenClue: string;
  image: string | null;
}

export interface Location {
  id: string;
  name: string;
  floor: string;
  description: string;
  objects: LocationObject[];
}

export interface LocationsData {
  intro: {
    title: string;
    description: string;
    tips: string[];
  };
  locations: Location[];
}

export interface NpcIntro {
  id: string;
  name: string;
  age: number;
  role: string;
  description: string;
  specialty: string;
}

export interface NpcsIntroData {
  intro: {
    title: string;
    description: string;
    tips: string[];
  };
  npcs: NpcIntro[];
}

export interface CaseMetadata {
  id: string;
  title: string;
  subtitle: string;
  synopsis: string;
  difficulty: string;
  estimatedMinutes: number;
  screenFlow: string[];
  endings: Array<{
    id: string;
    label: string;
    tier: string;
    description: string;
  }>;
  randomization: {
    clueOrder: boolean;
    decoyRate: number;
  };
  settings: {
    turnLimit: Record<string, number | null>;
    hintLimit: Record<string, number | null>;
  };
}

@Injectable()
export class YamlLoaderService {
  private readonly logger = new Logger(YamlLoaderService.name);
  private readonly casesPath: string;

  constructor() {
    // cases 디렉토리 경로 (프로젝트 루트 기준)
    this.casesPath = path.join(process.cwd(), '..', '..', 'cases');
    this.logger.log(`Cases path: ${this.casesPath}`);
  }

  /**
   * YAML 파일 읽기 헬퍼
   */
  private loadYaml<T>(filePath: string): T {
    try {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      return yaml.load(fileContents) as T;
    } catch (error) {
      this.logger.error(`Failed to load YAML file: ${filePath}`, error);
      throw new Error(`Failed to load YAML: ${filePath}`);
    }
  }

  /**
   * 케이스 메타데이터 로드
   */
  loadCaseMetadata(caseId: string): CaseMetadata {
    const yamlPath = path.join(this.casesPath, caseId, 'case.yaml');

    // YAML 파일이 없으면 JSON fallback
    if (!fs.existsSync(yamlPath)) {
      const jsonPath = path.join(this.casesPath, caseId, 'case.meta.json');
      if (fs.existsSync(jsonPath)) {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        return {
          ...data,
          subtitle: data.subtitle || '',
          screenFlow: data.screenFlow || ['intro', 'story', 'npcs', 'locations', 'game'],
        };
      }
    }

    return this.loadYaml<CaseMetadata>(yamlPath);
  }

  /**
   * 스토리 데이터 로드
   */
  loadStory(caseId: string): StoryData {
    const yamlPath = path.join(this.casesPath, caseId, 'story.yaml');
    return this.loadYaml<StoryData>(yamlPath);
  }

  /**
   * 장소 데이터 로드
   */
  loadLocations(caseId: string): LocationsData {
    const yamlPath = path.join(this.casesPath, caseId, 'locations.yaml');
    return this.loadYaml<LocationsData>(yamlPath);
  }

  /**
   * NPC 인트로 데이터 로드
   */
  loadNpcsIntro(caseId: string): NpcsIntroData {
    const yamlPath = path.join(this.casesPath, caseId, 'npcs-intro.yaml');
    return this.loadYaml<NpcsIntroData>(yamlPath);
  }

  /**
   * 케이스 존재 여부 확인
   */
  caseExists(caseId: string): boolean {
    const casePath = path.join(this.casesPath, caseId);
    return fs.existsSync(casePath) && fs.statSync(casePath).isDirectory();
  }

  /**
   * 모든 케이스 ID 목록
   */
  listCases(): string[] {
    if (!fs.existsSync(this.casesPath)) {
      return [];
    }

    return fs
      .readdirSync(this.casesPath)
      .filter((name) => {
        const fullPath = path.join(this.casesPath, name);
        return (
          fs.statSync(fullPath).isDirectory() &&
          !name.startsWith('_') && // _template 제외
          !name.startsWith('.')
        );
      });
  }
}
