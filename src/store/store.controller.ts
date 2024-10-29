import { UpdateStoreDto } from './dto/update-store.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createStore(
    @Body() createStoreDto: CreateStoreDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new HttpException('Image file is required', HttpStatus.BAD_REQUEST);
    }

    return await this.storeService.createStore(createStoreDto, file);
  }

  @Get()
  async findAll() {
    return await this.storeService.findAll();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return await this.storeService.findOne(slug);
  }

  @Patch(':slug')
  @UseInterceptors(FileInterceptor('file'))
  async updateStore(
    @Param('slug') slug: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      console.log('UpdateStoreDto:', updateStoreDto);
      console.log('Uploaded file:', file);

      const result = await this.storeService.updateStore(
        slug,
        updateStoreDto,
        file,
      );
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
