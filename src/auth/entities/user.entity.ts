import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserAddress } from '../../address/entities/user-address.entity';
import { Cart } from 'src/cart/entities/cart.entity';

enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  pin: string;

  @Column({ nullable: true })
  fullname: string;

  @OneToMany(() => UserAddress, (userAddress) => userAddress.user)
  userAddresses: UserAddress[];

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
