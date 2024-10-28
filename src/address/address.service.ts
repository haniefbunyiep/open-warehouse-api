import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { UserAddress } from './entities/user-address.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address) private addressRepository: Repository<Address>,

    @InjectRepository(UserAddress)
    private userAddressRepository: Repository<UserAddress>,
  ) {}

  async createUserAddress(createAddressDto: CreateAddressDto, user: User) {
    try {
      const address = this.addressRepository.create(createAddressDto);

      const newAddress = await this.addressRepository.save(address);

      const userAddress = this.userAddressRepository.create({
        address: newAddress,
        user: user,
      });

      await this.userAddressRepository.save(userAddress);

      return {
        message: 'Address created and linked to user successfully',
        data: userAddress,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findAll() {
    return { data: null };
  }
}
