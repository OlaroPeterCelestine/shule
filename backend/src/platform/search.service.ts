import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { DbService } from '../db/db.service.js';

const INDEX = process.env.SEARCH_INDEX || 'littleroyals-pupils';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly log = new Logger(SearchService.name);
  private client: Client | null = null;
  private connected = false;
  private lastError = '';

  constructor(private readonly db: DbService) {}

  node() {
    return process.env.OPENSEARCH_NODE || 'http://127.0.0.1:9200';
  }

  status() {
    return { ok: this.connected, node: this.node(), index: INDEX, lastError: this.lastError || undefined };
  }

  async onModuleInit() {
    try {
      this.client = new Client({ node: this.node(), ssl: { rejectUnauthorized: false }, requestTimeout: 2500 });
      await this.client.ping();
      const exists = await this.client.indices.exists({ index: INDEX });
      if (!exists.body) {
        await this.client.indices.create({
          index: INDEX,
          body: { mappings: { properties: { adm: { type: 'keyword' }, name: { type: 'text' }, cls: { type: 'keyword' } } } },
        });
      }
      this.connected = true;
      this.lastError = '';
      this.log.log('OpenSearch connected');
    } catch (err) {
      this.connected = false;
      this.client = null;
      this.lastError = err instanceof Error ? err.message : 'Search unreachable';
      this.log.warn('OpenSearch offline — /search falls back to Postgres: ' + this.lastError);
    }
  }

  async indexAll() {
    const pupils = await this.db.query<{ adm: string; name: string; cls: string }>('SELECT adm, name, cls FROM students');
    if (this.client && this.connected) {
      for (const p of pupils) {
        await this.client.index({ index: INDEX, id: p.adm, body: p, refresh: false });
      }
    }
    return { indexed: pupils.length, engine: this.connected ? 'opensearch' : 'postgres' };
  }

  async find(q: string) {
    const query = String(q || '').trim();
    if (!query) return [];
    if (this.client && this.connected) {
      try {
        const res = await this.client.search({
          index: INDEX,
          body: { query: { multi_match: { query, fields: ['name', 'adm', 'cls'] } }, size: 20 },
        });
        const hits = res.body.hits.hits as Array<{ _source?: { adm: string; name: string; cls: string } }>;
        return hits.map((h) => h._source).filter((s): s is { adm: string; name: string; cls: string } => !!s);
      } catch (err) {
        this.lastError = err instanceof Error ? err.message : 'Search failed';
      }
    }
    return this.db.query<{ adm: string; name: string; cls: string }>(
      'SELECT adm, name, cls FROM students WHERE name ILIKE $1 OR adm ILIKE $1 OR cls ILIKE $1 LIMIT 20',
      ['%' + query + '%'],
    );
  }
}
