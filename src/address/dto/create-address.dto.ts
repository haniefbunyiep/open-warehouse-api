import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  cityId: number;

  @IsNotEmpty()
  city: string;

  @IsNotEmpty()
  provinceId: number;

  @IsNotEmpty()
  province: string;
}
