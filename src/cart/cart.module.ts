import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from 'src/auth/entities/user.entity';
import { Cart } from './entities/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem, Product, User, Cart])],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
