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
import { CategoriesService } from 'src/categories/categories.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private categoryService: CategoriesService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createProductDto: CreateProductDto, file: Express.Multer.File) {
    const product = new Product();

    try {
      product.validateProductName(createProductDto.name);

      const baseSlug = product.formatSlug(createProductDto.name);

      const uniqueSlug = await product.createUniqueSlug(
        this.productRepository,
        baseSlug,
      );

      const category = await this.categoryService.findOne(
        createProductDto.category,
      );

      const imageUrl = await this.cloudinaryService.uploadFile(
        file,
        'products',
      );

      Object.assign(product, {
        ...createProductDto,
        slug: uniqueSlug,
        category: category,
        imageUrl,
      });

      return new ProductDto(await this.productRepository.save(product));
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
        relations: ['category'],
      });

      return products.flatMap((product) => new ProductDto(product));
    } catch (error) {
      return error;
    }
  }

  async findOne(slug: string) {
    try {
      const product = await this.productRepository.findOne({
        where: { slug },
        relations: ['category'],
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
