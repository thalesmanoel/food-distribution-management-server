import { decimalColumn } from 'src/commons/database/columns/decimal.column';
import { Supplier } from 'src/suppliers/entities/supplier.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  sku!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column(decimalColumn)
  price!: number;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplier_id' })
  supplier!: Supplier;

  @Column({ type: 'uuid' })
  supplier_id!: string;
}
