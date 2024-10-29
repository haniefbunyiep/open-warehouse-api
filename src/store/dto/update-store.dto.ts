import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateStoreDto {
  name?: string;

  address?: string;

  city?: string;

  cityId?: number;

  province?: string;

  provinceId?: number;
}
