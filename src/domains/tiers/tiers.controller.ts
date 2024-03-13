import { Controller, Get } from '@nestjs/common';
import { TiersService } from './tiers.service';

@Controller('tiers')
export class TiersController {
  constructor(private readonly tiersService: TiersService) {}
  @Get()
  getTiers() {
    return this.tiersService.getTiers();
  }

  @Get('fetch')
  fetchTiers() {
    return this.tiersService.fetchTiers();
  }
}
