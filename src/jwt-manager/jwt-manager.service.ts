import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtManagerService {
  constructor(private readonly configService: ConfigService) {}
}