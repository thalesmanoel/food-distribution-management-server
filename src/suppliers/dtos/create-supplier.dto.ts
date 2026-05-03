import { IsEmail, IsString } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  name!: string;

  @IsString()
  cnpj!: string;

  @IsString()
  phone!: string;

  @IsEmail()
  email!: string;

  @IsString()
  description?: string;

  @IsString()
  address!: string;
}
