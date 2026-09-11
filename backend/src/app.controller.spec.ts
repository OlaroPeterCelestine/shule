import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { StackService } from './platform/stack.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: StackService, useValue: { snapshot: () => ({ http: 'express', cache: { ok: false } }) } },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('returns api name', () => {
    expect(appController.root().ok).toBe(true);
    expect(appController.root().name).toContain('Little Royals');
  });
});
