import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dtos/create-customer.dto';
import { ApiResponseDto } from 'src/commons/dtos/api-response.dto';
import { Customer } from './entities/customers.entity';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  async create(
    @Body() body: CreateCustomerDto,
  ): Promise<ApiResponseDto<Customer>> {
    const customer = await this.customersService.create(body);
    return {
      message: 'Cliente criado com sucesso',
      data: customer,
    };
  }

  @Get()
  async findAll(): Promise<ApiResponseDto<Customer[]>> {
    const customers = await this.customersService.findAll();
    return {
      message: 'Clientes encontrados com sucesso',
      data: customers,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ApiResponseDto<Customer>> {
    const customer = await this.customersService.findById(id);
    return {
      message: 'Cliente encontrado com sucesso',
      data: customer,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<Customer>,
  ): Promise<ApiResponseDto<Customer>> {
    const customer = await this.customersService.update(id, body);
    return {
      message: 'Cliente atualizado com sucesso',
      data: customer,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<ApiResponseDto<null>> {
    await this.customersService.delete(id);
    return {
      message: 'Cliente deletado com sucesso',
      data: null,
    };
  }
}
