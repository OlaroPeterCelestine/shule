import { Controller, Get } from '@nestjs/common';
import { openApiSpec } from './openapi.js';
import { RELEASES } from './releases.js';

const NAME = 'Little Royals School OS API';
const VERSION = '0.0.1';

@Controller()
export class AppController {
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
      docs: '/api/openapi.json',
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
