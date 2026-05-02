import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { ApiResponseDto } from 'src/commons/dtos/api-response.dto';
import { Product } from './entities/products.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(
    @Body() body: CreateProductDto,
  ): Promise<ApiResponseDto<Product>> {
    const product = await this.productsService.create(body);
    return {
      message: 'Produto criado com sucesso',
      data: product,
    };
  }

  @Get()
  async findAll(): Promise<ApiResponseDto<Product[]>> {
    const products = await this.productsService.findAll();
    return {
      message: 'Produtos encontrados com sucesso',
      data: products,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ApiResponseDto<Product>> {
    const product = await this.productsService.findById(id);
    return {
      message: 'Produto encontrado com sucesso',
      data: product,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<Product>,
  ): Promise<ApiResponseDto<Product>> {
    const product = await this.productsService.update(id, body);
    return {
      message: 'Produto atualizado com sucesso',
      data: product,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<ApiResponseDto<null>> {
    await this.productsService.delete(id);
    return {
      message: 'Produto deletado com sucesso',
      data: null,
    };
  }
}
