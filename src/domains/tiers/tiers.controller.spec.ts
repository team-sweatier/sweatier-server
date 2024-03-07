import { Test, TestingModule } from '@nestjs/testing';
import { TiersController } from './tiers.controller';
import { TiersService } from './tiers.service';

describe('TiersController', () => {
  let controller: TiersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiersController],
      providers: [TiersService],
    }).compile();

    controller = module.get<TiersController>(TiersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
