import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { CategoriesModule } from 'src/categories/categories.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CartItem } from 'src/cart/entities/cart-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, CartItem]),
    CategoriesModule,
    CloudinaryModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
