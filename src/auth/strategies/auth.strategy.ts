import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interface/jwt.interface';
import { AuthService } from '../auth.service';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, 'auth') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY,
    });
  }

  async validate(payload: JwtPayload) {
    const encryptedToken = payload.secret;

    const decryptedToken = CryptoJS.AES.decrypt(
      encryptedToken,
      process.env.CRYPTO_SECRET_KEY,
    ).toString(CryptoJS.enc.Utf8);

    const user = await this.authService.findUserByEmail(decryptedToken);

    return user;
  }
}
