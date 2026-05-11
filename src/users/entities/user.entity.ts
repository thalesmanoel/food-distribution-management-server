import { AppBaseEntity } from 'src/commons/base/base.entity';
import { Entity, Column } from 'typeorm';

@Entity('users')
export class User extends AppBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
