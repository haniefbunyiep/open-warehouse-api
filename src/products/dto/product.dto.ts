import { Product } from '../entities/product.entity';

export class ProductDto {
  private name: string;
  private description: string;
  private price: number;
  private stock: number;
  private slug: string;
  private createdAt: Date;

  constructor(product: Product) {
    this.name = product.name;
    this.description = product.description;
    this.price = product.price;
    this.stock = product.stock;
    this.slug = product.slug;
    this.createdAt = product.createdAt;
  }
}
