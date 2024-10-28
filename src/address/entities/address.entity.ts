import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserAddress } from './user-address.entity';
import { Store } from 'src/store/entities/store.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column()
  address: string;

  @Column()
  cityId: number;

  @Column()
  city: string;

  @Column()
  provinceId: number;

  @Column()
  province: string;

  @OneToMany(() => UserAddress, (userAddress) => userAddress.address)
  userAddresses: UserAddress[];

  @OneToOne(() => Store, (store) => store.address)
  store: Store;
}
