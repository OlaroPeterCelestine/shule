import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '';

export function startTracing() {
  if (!endpoint) return;
  const sdk = new NodeSDK({
    serviceName: process.env.OTEL_SERVICE_NAME || 'littleroyals-api',
    traceExporter: new OTLPTraceExporter({ url: endpoint.replace(/\/+$/, '') + '/v1/traces' }),
    instrumentations: [getNodeAutoInstrumentations({ '@opentelemetry/instrumentation-fs': { enabled: false } })],
  });
  sdk.start();
}
