import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { REDIS_CLIENT } from './cache.constants';

describe('CacheService', () => {
  let service: CacheService;
  let redis: {
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
    exists: jest.Mock;
    options: { keyPrefix: string };
  };

  beforeEach(async () => {
    redis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      options: { keyPrefix: 'food:' },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheService, { provide: REDIS_CLIENT, useValue: redis }],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('desserializa o valor armazenado', async () => {
    redis.get.mockResolvedValue('{"id":"1"}');

    await expect(service.get('products:1')).resolves.toEqual({ id: '1' });
  });

  it('retorna null quando a chave não existe', async () => {
    redis.get.mockResolvedValue(null);

    await expect(service.get('products:1')).resolves.toBeNull();
  });

  it('grava com TTL em segundos', async () => {
    await service.set('products:1', { id: '1' }, 30);

    expect(redis.set).toHaveBeenCalledWith(
      'products:1',
      '{"id":"1"}',
      'EX',
      30,
    );
  });

  it('getOrSet usa o factory apenas quando não há cache', async () => {
    redis.get.mockResolvedValue(null);
    const factory = jest.fn().mockResolvedValue({ id: '1' });

    await expect(service.getOrSet('products:1', factory)).resolves.toEqual({
      id: '1',
    });
    expect(factory).toHaveBeenCalledTimes(1);
    expect(redis.set).toHaveBeenCalled();

    redis.get.mockResolvedValue('{"id":"1"}');
    await service.getOrSet('products:1', factory);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('não propaga erro quando o Redis falha', async () => {
    redis.get.mockRejectedValue(new Error('connection refused'));

    await expect(service.get('products:1')).resolves.toBeNull();
  });

  it('monta chaves com namespace', () => {
    expect(service.buildKey('products', 'all')).toBe('products:all');
  });
});
