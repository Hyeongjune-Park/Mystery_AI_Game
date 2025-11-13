import { Module } from '@nestjs/common';
import { YamlLoaderService } from './yaml-loader.service';
import { CasesController } from './cases.controller';

@Module({
  controllers: [CasesController],
  providers: [YamlLoaderService],
  exports: [YamlLoaderService],
})
export class CasesModule {}
