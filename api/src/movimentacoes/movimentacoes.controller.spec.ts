import { Test, TestingModule } from '@nestjs/testing';
import { MovimentacoesController } from './movimentacoes.controller';
import { MovimentacoesService } from './movimentacoes.service';

describe('MovimentacoesController', () => {
  let controller: MovimentacoesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovimentacoesController],
      providers: [MovimentacoesService],
    }).compile();

    controller = module.get<MovimentacoesController>(MovimentacoesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
