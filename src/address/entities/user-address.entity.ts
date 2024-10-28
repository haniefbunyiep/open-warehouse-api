// user-address.entity.ts
import { Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Address } from './address.entity';

@Entity()
export class UserAddress {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, (user) => user.userAddresses)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Address, (address) => address.userAddresses)
  @JoinColumn({ name: 'addressId' })
  address: Address;
}
