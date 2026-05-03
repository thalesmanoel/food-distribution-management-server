import { IsEmail, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  cnpj!: string;

  @IsString()
  phone!: string;

  @IsString()
  address!: string;

  @IsString()
  description?: string;
}
