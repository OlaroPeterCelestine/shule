import { Injectable } from '@nestjs/common';
import { collectDefaultMetrics, Counter, Histogram, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
  readonly registry = new Registry();
  readonly http = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP duration',
    labelNames: ['method', 'route', 'status'],
    registers: [this.registry],
  });
  readonly writes = new Counter({
    name: 'school_writes_total',
    help: 'School record writes',
    labelNames: ['module'],
    registers: [this.registry],
  });

  constructor() {
    collectDefaultMetrics({ register: this.registry });
  }

  async text() {
    return this.registry.metrics();
  }
}
