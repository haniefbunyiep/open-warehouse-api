import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { Repository } from 'typeorm';
import { Address } from 'src/address/entities/address.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store) private storeRepository: Repository<Store>,

    @InjectRepository(Address) private addressRepository: Repository<Address>,
  ) {}

  private generateSlug(name: string): string {
    const timestamp = Date.now();
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    return `${baseSlug}-${timestamp}`;
  }

  async createStore(createStoreDto: CreateStoreDto) {
    const { name, address, city, cityId, province, provinceId } =
      createStoreDto;

    try {
      const slug = this.generateSlug(name);

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
}
