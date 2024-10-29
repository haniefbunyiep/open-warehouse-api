import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { UserSignUpDto } from './dto/user-signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() userSignUpDto: UserSignUpDto) {
    return this.authService.signUp(userSignUpDto);
  }

  @Post('signin')
  signIn(@Body() authCredentialsDto: AuthCredentialsDto) {
    return this.authService.signIn(authCredentialsDto);
  }

  @Post('me')
  @UseGuards(AuthGuard('auth'))
  getProtected(@GetUser() user: User) {
    return { message: 'Get User Information', data: user };
  }
}
