import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/request/create-product.dto';
import { UpdateProductDto } from './dto/request/update-product.dto';
import { ProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = new Product();

    try {
      product.validateProductName(createProductDto.name);

      const baseSlug = product.formatSlug(createProductDto.name);

      const uniqueSlug = await product.createUniqueSlug(
        this.productRepository,
        baseSlug,
      );

      Object.assign(product, {
        ...createProductDto,
        slug: uniqueSlug,
      });

      return await this.productRepository.save(product);
    } catch (error) {
      if (error instanceof BadRequestException) {
        return new BadRequestException('Failed to create product');
      }
      return new InternalServerErrorException('Internal server error');
    }
  }

  async findAll() {
    try {
      const products = await this.productRepository.find({
        where: { deletedAt: null },
      });

      return products.flatMap((product) => new ProductDto(product));
    } catch (error) {
      throw error;
    }
  }

  async findOne(slug: string) {
    try {
      const product = await this.productRepository.findOne({
        where: { slug },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      return new ProductDto(product);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return new NotFoundException('Product not found');
      }
      return new InternalServerErrorException('Internal Server Error');
    }
  }

  async update(slug: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productRepository.findOne({
        where: { slug },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      Object.assign(product, updateProductDto);

      return await this.productRepository.save(product);
    } catch (error) {
      if (error instanceof BadRequestException) {
        return new BadRequestException('Failed to create product');
      }
      if (error instanceof NotFoundException) {
        return new NotFoundException('Product not found');
      }
      return new InternalServerErrorException('Internal server error');
    }
  }

  remove(slug: string) {
    return `This action removes a #${slug} product`;
  }
}
