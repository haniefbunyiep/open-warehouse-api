import { BadRequestException } from '@nestjs/common';
import { customAlphabet } from 'nanoid/non-secure'; // Changed this line
import { Category } from 'src/categories/entities/category.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Repository,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'name', nullable: false, length: 255 })
  name: string;

  @Column({ name: 'description', nullable: false, length: 255 })
  description: string;

  @Column({ name: 'price', type: 'decimal', nullable: false })
  price: number;

  @Column({ name: 'stock', nullable: false })
  stock: number;

  @Column({ name: 'slug', unique: true })
  slug: string;

  @Column({ name: 'imageUrl' })
  imageUrl: string;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  async createUniqueSlug(
    repository: Repository<Product>,
    baseSlug: string,
    attempts = 0,
  ): Promise<string> {
    const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);
    let slugAttempt = baseSlug;

    // If we've had a collision, append the nanoid
    if (attempts > 0) {
      slugAttempt = `${baseSlug}-${nanoid()}`;
    }

    // Check if slug exists
    const slugExists = await repository.findOne({
      where: { slug: slugAttempt },
    });

    // If slug exists and we haven't tried too many times, try again
    if (slugExists && attempts < 3) {
      return this.createUniqueSlug(repository, baseSlug, attempts + 1);
    }

    // If we've tried too many times, throw an error
    if (attempts >= 3) {
      throw new BadRequestException(
        'Unable to generate unique slug. Please try a different product name.',
      );
    }

    return slugAttempt;
  }

  validateProductName(name: string): void {
    if (!name) {
      throw new BadRequestException('Product name is required');
    }

    if (name.length < 3) {
      throw new BadRequestException(
        'Product name must be at least 3 characters long',
      );
    }

    if (name.length > 100) {
      throw new BadRequestException(
        'Product name must not exceed 100 characters',
      );
    }

    // Check for valid characters
    const validNameRegex = /^[a-zA-Z0-9\s\-_.,!&()]+$/;
    if (!validNameRegex.test(name)) {
      throw new BadRequestException('Product name contains invalid characters');
    }
  }

  formatSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
  }
}
