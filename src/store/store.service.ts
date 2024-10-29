import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { Repository } from 'typeorm';
import { Address } from 'src/address/entities/address.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store) private storeRepository: Repository<Store>,
    @InjectRepository(Address) private addressRepository: Repository<Address>,
    private cloudinaryService: CloudinaryService,
  ) {}

  private generateSlug(name: string): string {
    const timestamp = Date.now();
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    return `${baseSlug}-${timestamp}`;
  }

  async createStore(createStoreDto: CreateStoreDto, file: Express.Multer.File) {
    const { name, address, city, cityId, province, provinceId } =
      createStoreDto;

    try {
      const slug = this.generateSlug(name);

      const imageUrl = await this.cloudinaryService.uploadFile(
        file,
        'store-images',
      );

      const createAddress = this.addressRepository.create({
        address,
        city,
        cityId,
        provinceId,
        province,
      });
      const newAddress = await this.addressRepository.save(createAddress);

      if (!newAddress) {
        throw new HttpException(
          'Failed to create address',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const store = this.storeRepository.create({
        name,
        address: newAddress,
        slug,
        imageUrl,
      });
      const savedStore = await this.storeRepository.save(store);

      return {
        message: 'Create Store Success',
        data: savedStore,
      };
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

  async findAll() {
    try {
      const store = await this.storeRepository.find({
        where: {
          deletedAt: null,
        },
      });
      if (!store) {
        return { message: 'Get all store', data: [] };
      }

      return { message: 'Get all store', data: store };
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

  async findOne(slug: string) {
    try {
      const store = await this.storeRepository.findOne({
        where: { slug },
        relations: ['address'],
      });

      if (!store) {
        throw new HttpException('Store not found', HttpStatus.NOT_FOUND);
      }

      return store;
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

  async updateStore(
    slug: string,
    updateStoreDto: UpdateStoreDto,
    file?: Express.Multer.File,
  ) {
    try {
      const store = await this.findOne(slug);

      // console.log(updateStoreDto);

      if (updateStoreDto.name && updateStoreDto.name !== store.name) {
        store.slug = this.generateSlug(updateStoreDto.name);
        store.name = updateStoreDto.name;
      }

      if (
        updateStoreDto.address ||
        updateStoreDto.city ||
        updateStoreDto.cityId ||
        updateStoreDto.province ||
        updateStoreDto.provinceId
      ) {
        const updatedAddress = {
          ...store.address,
          ...updateStoreDto,
        };
        await this.addressRepository.save(updatedAddress);
      }

      if (file) {
        const imageUrl = await this.cloudinaryService.uploadFile(
          file,
          'store-images',
        );
        store.imageUrl = imageUrl;
      }

      const updatedStore = await this.storeRepository.save(store);

      return {
        message: 'Store updated successfully',
        data: updatedStore,
      };
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

  async delete(slug: string) {
    try {
      await this.findOne(slug);

      await this.storeRepository.softDelete({ slug });

      return {
        message: 'Store soft deleted successfully',
      };
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
