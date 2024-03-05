import { Global, Module } from '@nestjs/common';
import { JwtManagerService } from './jwt-manager.service';

@Global()
@Module({
  providers: [JwtManagerService],
  exports: [JwtManagerService],
})
export class JwtManagerModule {}
