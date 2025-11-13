import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { YamlLoaderService } from './yaml-loader.service';

@Controller('cases')
export class CasesController {
  constructor(private readonly yamlLoader: YamlLoaderService) {}

  /**
   * GET /cases - 모든 케이스 목록
   */
  @Get()
  listCases() {
    const caseIds = this.yamlLoader.listCases();
    return {
      cases: caseIds.map((id) => {
        try {
          const metadata = this.yamlLoader.loadCaseMetadata(id);
          return {
            id: metadata.id,
            title: metadata.title,
            subtitle: metadata.subtitle,
            synopsis: metadata.synopsis,
            difficulty: metadata.difficulty,
            estimatedMinutes: metadata.estimatedMinutes,
          };
        } catch (error) {
          return {
            id,
            error: 'Failed to load metadata',
          };
        }
      }),
    };
  }

  /**
   * GET /cases/:id/metadata - 케이스 메타데이터
   */
  @Get(':id/metadata')
  getCaseMetadata(@Param('id') caseId: string) {
    if (!this.yamlLoader.caseExists(caseId)) {
      throw new NotFoundException(`Case ${caseId} not found`);
    }
    return this.yamlLoader.loadCaseMetadata(caseId);
  }

  /**
   * GET /cases/:id/story - 스토리 데이터
   */
  @Get(':id/story')
  getStory(@Param('id') caseId: string) {
    if (!this.yamlLoader.caseExists(caseId)) {
      throw new NotFoundException(`Case ${caseId} not found`);
    }
    return this.yamlLoader.loadStory(caseId);
  }

  /**
   * GET /cases/:id/locations - 장소 데이터
   */
  @Get(':id/locations')
  getLocations(@Param('id') caseId: string) {
    if (!this.yamlLoader.caseExists(caseId)) {
      throw new NotFoundException(`Case ${caseId} not found`);
    }
    return this.yamlLoader.loadLocations(caseId);
  }

  /**
   * GET /cases/:id/npcs-intro - NPC 인트로 데이터
   */
  @Get(':id/npcs-intro')
  getNpcsIntro(@Param('id') caseId: string) {
    if (!this.yamlLoader.caseExists(caseId)) {
      throw new NotFoundException(`Case ${caseId} not found`);
    }
    return this.yamlLoader.loadNpcsIntro(caseId);
  }
}
