import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { DEFAULT_CACHE_TTL, REDIS_CLIENT } from './cache.constants';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (value === null) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.warn(
        `Falha ao ler a chave "${key}" do cache: ${(error as Error).message}`,
      );
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttl: number = DEFAULT_CACHE_TTL,
  ): Promise<void> {
    try {
      const payload = JSON.stringify(value);

      if (ttl > 0) {
        await this.redis.set(key, payload, 'EX', ttl);
      } else {
        await this.redis.set(key, payload);
      }
    } catch (error) {
      this.logger.warn(
        `Falha ao gravar a chave "${key}" no cache: ${(error as Error).message}`,
      );
    }
  }

  async del(key: string | string[]): Promise<void> {
    const keys = Array.isArray(key) ? key : [key];
    if (keys.length === 0) {
      return;
    }

    try {
      await this.redis.del(...keys);
    } catch (error) {
      this.logger.warn(
        `Falha ao remover chaves do cache: ${(error as Error).message}`,
      );
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    const prefix = this.redis.options.keyPrefix ?? '';

    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          `${prefix}${pattern}`,
          'COUNT',
          100,
        );
        cursor = nextCursor;

        if (keys.length > 0) {
          await this.redis.del(
            ...keys.map((fullKey) => fullKey.slice(prefix.length)),
          );
        }
      } while (cursor !== '0');
    } catch (error) {
      this.logger.warn(
        `Falha ao remover o padrão "${pattern}" do cache: ${(error as Error).message}`,
      );
    }
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = DEFAULT_CACHE_TTL,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    if (value !== null && value !== undefined) {
      await this.set(key, value, ttl);
    }

    return value;
  }

  async has(key: string): Promise<boolean> {
    try {
      return (await this.redis.exists(key)) > 0;
    } catch (error) {
      this.logger.warn(
        `Falha ao verificar a chave "${key}" no cache: ${(error as Error).message}`,
      );
      return false;
    }
  }

  buildKey(...parts: (string | number)[]): string {
    return parts.filter((part) => part !== '').join(':');
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
