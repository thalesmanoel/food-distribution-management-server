import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSupplierDto } from './dtos/create-supplier.dto';
import { Supplier } from './entities/suppliers.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private suppliersRepository: Repository<Supplier>,
  ) {}

  async findAll(): Promise<Supplier[]> {
    return this.suppliersRepository.find();
  }

  async findById(id: string): Promise<Supplier> {
    const supplier = await this.suppliersRepository.findOneBy({ id });

    if (!supplier) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    return supplier;
  }

  async create(data: CreateSupplierDto): Promise<Supplier> {
    const existingSupplier = await this.suppliersRepository.findOne({
      where: [{ email: data.email }, { cnpj: data.cnpj }],
    });

    if (existingSupplier) {
      throw new ConflictException('Fornecedor com email ou CNPJ já existe');
    }

    const newSupplier = this.suppliersRepository.create(data);
    return this.suppliersRepository.save(newSupplier);
  }

  async update(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const existingSupplier = await this.findById(id);

    if (!existingSupplier) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    await this.suppliersRepository.update(id, data);

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const existingSupplier = await this.findById(id);

    if (!existingSupplier) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    await this.suppliersRepository.delete(id);
  }
}
