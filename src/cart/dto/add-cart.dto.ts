import { IsNotEmpty } from 'class-validator';

export class AddCartDto {
  @IsNotEmpty()
  productId: string;

  @IsNotEmpty()
  quantity: number;
}
