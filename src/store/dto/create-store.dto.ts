import { IsNotEmpty } from 'class-validator';

export class CreateStoreDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
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
