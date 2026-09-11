import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class SecretsService implements OnModuleInit {
  private readonly log = new Logger(SecretsService.name);
  private vaultOk = false;
  private lastError = '';

  status() {
    return {
      ok: this.vaultOk || !process.env.VAULT_ADDR,
      source: this.vaultOk ? 'vault' : 'env',
      addr: process.env.VAULT_ADDR || undefined,
      lastError: this.lastError || undefined,
    };
  }

  get(name: string, fallback = '') {
    return process.env[name] || fallback;
  }

  async onModuleInit() {
    const addr = process.env.VAULT_ADDR;
    const token = process.env.VAULT_TOKEN;
    if (!addr || !token) return;
    try {
      const path = process.env.VAULT_KV_PATH || 'v1/secret/data/littleroyals';
      const res = await fetch(addr.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, ''), {
        headers: { 'X-Vault-Token': token },
      });
      if (!res.ok) throw new Error('Vault ' + res.status);
      const body = (await res.json()) as { data?: { data?: Record<string, string> } };
      const kv = body.data?.data ?? {};
      for (const [key, value] of Object.entries(kv)) {
        if (value && !process.env[key]) process.env[key] = value;
      }
      this.vaultOk = true;
      this.log.log('Vault secrets loaded');
    } catch (err) {
      this.vaultOk = false;
      this.lastError = err instanceof Error ? err.message : 'Vault unreachable';
      this.log.warn('Vault offline — using process env: ' + this.lastError);
    }
  }
}
