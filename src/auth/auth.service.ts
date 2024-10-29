import { UserSignUpDto } from './dto/user-signup.dto';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { AES } from 'crypto-js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private jwtService: JwtService,
  ) {}

  async findUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
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

  async findUserById(id: string) {
    try {
      const user = this.userRepository.findOne({
        where: {
          id,
        },
      });

      if (!user)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);

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

  async signUp(userSignUpDto: UserSignUpDto) {
    try {
      const { email, password, fullname } = userSignUpDto;

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
        fullname,
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

  async signIn(userCredentialsDto: AuthCredentialsDto) {
    const { email, password } = userCredentialsDto;
    try {
      const user = await this.findUserByEmail(email);

      const comparePassword = await bcrypt.compare(password, user.password);

      if (!comparePassword) {
        throw new HttpException(
          `Password doesn't Match`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const encryptedEmail = AES.encrypt(
        email,
        process.env.CRYPTO_SECRET_KEY,
      ).toString();

      const payload = { encryptedEmail };
      const JwtToken: string = await this.jwtService.sign(payload);

      return {
        message: 'Sign In Success',
        data: JwtToken,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Internal server error :${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
