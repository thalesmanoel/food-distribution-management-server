import { AppBaseEntity } from 'src/commons/base/base.entity';
import { Entity, Column } from 'typeorm';

@Entity('suppliers')
export class Supplier extends AppBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  cnpj!: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255 })
  address!: string;
}
