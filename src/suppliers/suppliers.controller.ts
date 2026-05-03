import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dtos/create-supplier.dto';
import { ApiResponseDto } from 'src/commons/dtos/api-response.dto';
import { Supplier } from './entities/suppliers.entity';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  async create(
    @Body() body: CreateSupplierDto,
  ): Promise<ApiResponseDto<Supplier>> {
    const supplier = await this.suppliersService.create(body);
    return {
      message: 'Fornecedor criado com sucesso',
      data: supplier,
    };
  }

  @Get()
  async findAll(): Promise<ApiResponseDto<Supplier[]>> {
    const suppliers = await this.suppliersService.findAll();
    return {
      message: 'Fornecedores encontrados com sucesso',
      data: suppliers,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ApiResponseDto<Supplier>> {
    const supplier = await this.suppliersService.findById(id);
    return {
      message: 'Fornecedor encontrado com sucesso',
      data: supplier,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<Supplier>,
  ): Promise<ApiResponseDto<Supplier>> {
    const supplier = await this.suppliersService.update(id, body);
    return {
      message: 'Fornecedor atualizado com sucesso',
      data: supplier,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<ApiResponseDto<null>> {
    await this.suppliersService.delete(id);
    return {
      message: 'Fornecedor deletado com sucesso',
      data: null,
    };
  }
}
