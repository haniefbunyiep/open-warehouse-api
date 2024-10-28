import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/request/create-category.dto';
import { UpdateCategoryDto } from './dto/request/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':categoryName')
  findOne(@Param('categoryName') categoryName: string) {
    return this.categoriesService.findOne(categoryName);
  }

  @Patch(':categoryName')
  update(
    @Param('categoryName') categoryName: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(categoryName, updateCategoryDto);
  }

  @Delete(':categoryName')
  remove(@Param('categoryName') categoryName: string) {
    return this.categoriesService.remove(categoryName);
  }
}
