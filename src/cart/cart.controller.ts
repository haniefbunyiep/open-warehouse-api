import { AddCartDto } from './dto/add-cart.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@Controller('cart')
@UseGuards(AuthGuard('auth'))
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addToCart(@GetUser() user: User, @Body() addCartDto: AddCartDto) {
    return this.cartService.addToCart(user, addCartDto);
  }
}
