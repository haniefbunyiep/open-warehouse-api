import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return user;
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

  async signUp(authCredentialsDto: AuthCredentialsDto) {
    try {
      const { email, password } = authCredentialsDto;

      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        throw new HttpException(
          'Email already registered',
          HttpStatus.CONFLICT,
        );
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = this.userRepository.create({
        email,
        password: hashedPassword,
      });

      await this.userRepository.save(newUser);

      return { message: 'User successfully registered', data: null };
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

  // async signIn(userCredentialsDto: AuthCredentialsDto) {
  //   try {
  //     const { email, password } = userCredentialsDto;
  //   } catch (error) {}
  // }
}
