import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/request/create-category.dto';
import { UpdateCategoryDto } from './dto/request/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const isCategoryExist = await this.categoryRepository.findOne({
        where: { name: createCategoryDto.name },
      });
      if (isCategoryExist) {
        throw new ConflictException('Category already exist');
      }

      const cateogry = new Category();
      Object.assign(cateogry, {
        ...createCategoryDto,
        name: createCategoryDto.name.toLowerCase(),
      });

      return await this.categoryRepository.save(cateogry);
    } catch (error) {
      if (error instanceof ConflictException) {
        return new ConflictException('Category already exist');
      }
      if (error instanceof BadRequestException) {
        return new BadRequestException('Failed to create category');
      }
      return error;
    }
  }

  async findAll() {
    try {
      return await this.categoryRepository.find({
        where: { deletedAt: null },
      });
    } catch (error) {
      return error;
    }
  }

  async findOne(categoryName: string) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { name: categoryName.toLowerCase() },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      return category;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return new NotFoundException('Category not found');
      }
      return error;
    }
  }

  async update(categoryName: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const isCategoryExist = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name },
      });

      if (isCategoryExist) {
        throw new ConflictException('Category already exist');
      }

      const category = await this.categoryRepository.findOne({
        where: { name: categoryName },
      });

      Object.assign(category, updateCategoryDto);

      return await this.categoryRepository.save(category);
    } catch (error) {
      if (error instanceof ConflictException) {
        return new ConflictException('Category already exist');
      }
      if (error instanceof BadRequestException) {
        return new BadRequestException('Failed to create category');
      }
      return error;
    }
  }

  remove(categoryName: string) {
    return `This action removes a #${categoryName} category`;
  }
}
