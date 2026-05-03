import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Customer } from './entities/customers.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCustomerDto } from './dtos/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  async findAll(): Promise<Customer[]> {
    return this.customersRepository.find();
  }

  async findById(id: string): Promise<Customer> {
    const customer = await this.customersRepository.findOneBy({ id });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return customer;
  }

  async create(data: CreateCustomerDto): Promise<Customer> {
    const existingCustomer = await this.customersRepository.findOne({
      where: [{ email: data.email }, { cnpj: data.cnpj }],
    });

    if (existingCustomer) {
      throw new ConflictException('Cliente com email ou CNPJ já existe');
    }

    const newCustomer = this.customersRepository.create(data);
    return this.customersRepository.save(newCustomer);
  }

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    const existingCustomer = await this.findById(id);

    if (!existingCustomer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    await this.customersRepository.update(id, data);

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const existingCustomer = await this.findById(id);

    if (!existingCustomer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    await this.customersRepository.delete(id);
  }
}
