import { Category } from '../entities/category.entity';

export class CategoryDto {
  name: string;
  description: string;
  createdAt: Date;

  constructor(category: Category) {
    this.name = category.name;
    this.description = category.description;
    this.createdAt = category.createdAt;
  }
}
