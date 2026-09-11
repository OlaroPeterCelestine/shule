import { Controller, Get } from '@nestjs/common';
import { openApiSpec } from './openapi.js';
import { StackService } from './platform/stack.service.js';
import { RELEASES } from './releases.js';

const NAME = 'Little Royals School OS API';
const VERSION = '0.0.1';

@Controller()
export class AppController {
  constructor(private readonly stack: StackService) {}

  @Get()
  root() {
    return { ok: true, name: NAME, version: VERSION };
  }

  @Get('status')
  status() {
    return {
      ok: true,
      name: NAME,
      version: VERSION,
      time: new Date().toISOString(),
      docs: '/api/docs',
      openapi: '/api/openapi.json',
      stack: this.stack.snapshot(),
    };
  }

  @Get('openapi.json')
  spec() {
    return openApiSpec();
  }

  @Get('openapi')
  specAlt() {
    return openApiSpec();
  }

  @Get('releases')
  releases() {
    return RELEASES;
  }
}
