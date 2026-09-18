import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { CacheService } from '../cache/cache.service';

const PRODUCTS_CACHE_NAMESPACE = 'products';
const PRODUCTS_CACHE_TTL = 300;

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.cacheService.getOrSet(
      this.cacheService.buildKey(PRODUCTS_CACHE_NAMESPACE, 'all'),
      () => this.productsRepository.find(),
      PRODUCTS_CACHE_TTL,
    );
  }

  async findById(id: string): Promise<Product> {
    const product = await this.cacheService.getOrSet(
      this.cacheService.buildKey(PRODUCTS_CACHE_NAMESPACE, id),
      () => this.productsRepository.findOneBy({ id }),
      PRODUCTS_CACHE_TTL,
    );

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  async create(product: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productsRepository.findOneBy({
      sku: product.sku,
    });

    if (existingProduct) {
      throw new ConflictException('Produto com SKU já existe');
    }

    const newProduct = this.productsRepository.create(product);
    const savedProduct = await this.productsRepository.save(newProduct);

    await this.invalidateCache();

    return savedProduct;
  }

  async update(id: string, product: UpdateProductDto): Promise<Product> {
    await this.findById(id);

    await this.productsRepository.update(id, product);
    await this.invalidateCache(id);

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);

    await this.productsRepository.delete(id);
    await this.invalidateCache(id);
  }

  private async invalidateCache(id?: string): Promise<void> {
    const keys = [this.cacheService.buildKey(PRODUCTS_CACHE_NAMESPACE, 'all')];

    if (id) {
      keys.push(this.cacheService.buildKey(PRODUCTS_CACHE_NAMESPACE, id));
    }

    await this.cacheService.del(keys);
  }
}
