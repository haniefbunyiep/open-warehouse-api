import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { AddressModule } from 'src/address/address.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Store]), AddressModule, CloudinaryModule],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}
