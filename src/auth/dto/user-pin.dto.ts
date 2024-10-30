import { IsNotEmpty } from 'class-validator';

export class UserPinDto {
  @IsNotEmpty()
  pin: string;
}
