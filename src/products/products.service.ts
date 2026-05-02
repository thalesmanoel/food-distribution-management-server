import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Product } from './entities/products.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from './dtos/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productsRepository.findOneBy({ id });
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
    return this.productsRepository.save(newProduct);
  }

  async update(id: string, product: Partial<Product>): Promise<Product> {
    const existingProduct = await this.findById(id);
    if (!existingProduct) {
      throw new NotFoundException('Produto não encontrado');
    }

    await this.productsRepository.update(id, product);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const existingProduct = await this.findById(id);
    if (!existingProduct) {
      throw new NotFoundException('Produto não encontrado');
    }

    await this.productsRepository.delete(id);
  }
}
