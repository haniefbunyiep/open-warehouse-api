import { CategoryDto } from 'src/categories/dto/category.dto';
import { Product } from '../entities/product.entity';

export class ProductDto {
  private name: string;
  private description: string;
  private price: number;
  private stock: number;
  private slug: string;
  private category: CategoryDto;
  private imageUrl: string;
  private createdAt: Date;

  constructor(product: Product) {
    this.name = product.name;
    this.description = product.description;
    this.price = product.price;
    this.stock = product.stock;
    this.slug = product.slug;
    this.category = new CategoryDto(product.category);
    this.imageUrl = product.imageUrl;
    this.createdAt = product.createdAt;
  }
}
