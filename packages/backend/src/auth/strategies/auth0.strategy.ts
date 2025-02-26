import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-auth0';
import { ConfigService } from '@nestjs/config';
import { Role } from '../enums/role.enum';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
  constructor(private configService: ConfigService) {
    super({
      domain: configService.get<string>('AUTH0_DOMAIN') || '',
      clientID: configService.get<string>('AUTH0_CLIENT_ID') || '',
      clientSecret: configService.get<string>('AUTH0_CLIENT_SECRET') || '',
      callbackURL: 'http://localhost:3000/api/auth/callback',
      //audience: configService.get<string>('AUTH0_AUDIENCE'),
      //scope: 'openid email profile',
      //passReqToCallback: true,
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    extraParams: any,
    profile: {
      id: string;
      emails: { value: string }[];
    },
  ) {
    return {
      id: profile.id,
      email: profile.emails[0].value,
      role: Role.ADMIN,
    };
  }
}
