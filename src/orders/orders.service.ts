import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dtos/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['items'],
    });
  }

  async findById(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return order;
  }

  async create(data: CreateOrderDto): Promise<Order> {
    const total = data.items.reduce((acc, item) => {
      const itemTotal = item.price * item.quantity;

      const discount = item.discount || 0;

      return acc + (itemTotal - discount);
    }, 0);

    const order = this.ordersRepository.create({
      ...data,
      total,
    });

    return this.ordersRepository.save(order);
  }

  async delete(id: string): Promise<void> {
    const order = await this.findById(id);
    await this.ordersRepository.delete(order.id);
  }
}
