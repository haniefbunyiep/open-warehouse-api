import { AddCartDto } from './dto/add-cart.dto';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { User } from 'src/auth/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,

    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  async findCart(user: User, isCheckout?: boolean) {
    const cart = await this.cartRepository.findOne({
      where: {
        user: { id: user.id },
        isCheckout: isCheckout ? isCheckout : false,
      },
    });

    return cart;
  }

  async findCartItem(product: string, cartId: string) {
    const cartItem = await this.cartItemRepository.findOne({
      where: {
        product: { id: product },
        cart: { id: cartId },
      },
    });

    return cartItem;
  }

  async addToCart(user: User, addCartDto: AddCartDto) {
    try {
      const existingCart = await this.findCart(user);

      if (!existingCart) {
        const product = await this.productRepository.findOne({
          where: {
            id: addCartDto.productId,
          },
        });

        const newCart = await this.cartRepository.create({
          user,
          totalPrice: 0,
        });

        const cart = await this.cartRepository.save(newCart);

        const newCartItem = await this.cartItemRepository.create({
          product: product,
          quantity: addCartDto.quantity,
          cart: cart,
          totalPrice: addCartDto.quantity * product.price,
        });

        await this.cartItemRepository.save(newCartItem);

        await this.cartRepository.update(cart.id, {
          totalPrice: newCartItem.totalPrice,
        });

        return { message: 'Add new cart success', data: [] };
      } else {
        const existingCartItem = await this.findCartItem(
          addCartDto.productId,
          existingCart.id,
        );

        const product = await this.productRepository.findOne({
          where: {
            id: addCartDto.productId,
          },
        });

        if (existingCartItem) {
          await this.cartItemRepository.update(existingCartItem.id, {
            quantity:
              Number(existingCartItem.quantity) + Number(addCartDto.quantity),
            totalPrice:
              Number(existingCartItem.totalPrice) +
              Number(addCartDto.quantity) * Number(product.price),
          });

          await this.cartRepository.update(existingCart.id, {
            totalPrice:
              Number(existingCart.totalPrice) +
              Number(addCartDto.quantity * Number(product.price)),
          });

          return { message: 'Add product success', data: [] };
        }

        const newCartItem = await this.cartItemRepository.create({
          product: product,
          quantity: addCartDto.quantity,
          cart: existingCart,
          totalPrice: addCartDto.quantity * product.price,
        });

        await this.cartRepository.update(existingCart.id, {
          totalPrice:
            Number(existingCart.totalPrice) +
            Number(addCartDto.quantity) * Number(product.price),
        });

        await this.cartItemRepository.save(newCartItem);

        return { message: 'Add new product success', data: [] };
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
