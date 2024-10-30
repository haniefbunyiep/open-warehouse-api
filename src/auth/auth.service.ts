import { UserSignUpDto } from './dto/user-signup.dto';
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { AES } from 'crypto-js';
import { UserPinDto } from './dto/user-pin.dto';
import { handleException } from 'src/utils/exception.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private jwtService: JwtService,
  ) {}

  async findUserByEmail(email: string): Promise<User> {
    this.logger.log(`Attempting to find user by email: ${email}`);
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        this.logger.warn(`Email not found: ${email}`);
        throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
      }

      this.logger.log(`User found with email: ${email}`);
      return user;
    } catch (error) {
      handleException(error, 'Error finding user by email', this.logger);
    }
  }

  async findUserById(id: string) {
    this.logger.log(`Attempting to find user by ID: ${id}`);
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        this.logger.warn(`User not found with ID: ${id}`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      this.logger.log(`User found with ID: ${id}`);
      return user;
    } catch (error) {
      handleException(error, 'Error finding user by ID', this.logger);
    }
  }

  async signUp(userSignUpDto: UserSignUpDto) {
    const { email, password, fullname } = userSignUpDto;
    this.logger.log(`Attempting to sign up user with email: ${email}`);
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        this.logger.warn(`Email already registered: ${email}`);
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

      this.logger.log(`User successfully registered with email: ${email}`);
      return { message: 'User successfully registered', data: null };
    } catch (error) {
      handleException(error, 'Error during user sign-up', this.logger);
    }
  }

  async signIn(userCredentialsDto: AuthCredentialsDto) {
    const { email, password } = userCredentialsDto;
    this.logger.log(`Attempting to sign in user with email: ${email}`);
    try {
      const user = await this.findUserByEmail(email);

      const comparePassword = await bcrypt.compare(password, user.password);

      if (!comparePassword) {
        this.logger.warn(`Password mismatch for user with email: ${email}`);
        throw new HttpException(
          "Password doesn't match",
          HttpStatus.BAD_REQUEST,
        );
      }

      const secret = AES.encrypt(
        email,
        process.env.CRYPTO_SECRET_KEY,
      ).toString();
      const payload = { secret };
      const JwtToken: string = await this.jwtService.sign(payload);

      this.logger.log(`User signed in successfully with email: ${email}`);
      return {
        message: 'Sign In Success',
        data: JwtToken,
      };
    } catch (error) {
      handleException(error, 'Error during user sign-in', this.logger);
    }
  }

  async updateUserPin(userPinDto: UserPinDto, user: User) {
    const { id, email } = user;
    const { pin } = userPinDto;

    this.logger.log(
      `Starting updateUserPin for user ID: ${id}, Email: ${email}`,
    );
    try {
      const existingUser = await this.findUserById(id);
      if (!existingUser) {
        this.logger.warn(`User with ID: ${id} not found`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const hashedPin = await bcrypt.hash(pin, 10);
      await this.userRepository.update({ id }, { pin: hashedPin });

      this.logger.log(`User PIN updated successfully for user ID: ${id}`);
      return {
        message: 'User pin updated successfully',
        data: [],
      };
    } catch (error) {
      handleException(error, 'Error updating user PIN', this.logger);
    }
  }
}
