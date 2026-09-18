import { Logger, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './cache.constants';

export const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: (configService: ConfigService): Redis => {
    const logger = new Logger('RedisClient');

    const client = new Redis({
      host: configService.getOrThrow<string>('REDIS_HOST'),
      port: +configService.getOrThrow<number>('REDIS_PORT'),
      password: configService.get<string>('REDIS_PASSWORD') || undefined,
      db: +(configService.get<number>('REDIS_DB') ?? 0),
      keyPrefix: configService.get<string>('REDIS_KEY_PREFIX') ?? 'food:',
      lazyConnect: true,
      maxRetriesPerRequest: 2,
    });

    client.on('error', (error: Error) => {
      logger.error(`Erro na conexão com o Redis: ${error.message}`);
    });

    client.on('connect', () => {
      logger.log('Conectado ao Redis');
    });

    client.connect().catch((error: Error) => {
      logger.error(`Não foi possível conectar ao Redis: ${error.message}`);
    });

    return client;
  },
  inject: [ConfigService],
};
