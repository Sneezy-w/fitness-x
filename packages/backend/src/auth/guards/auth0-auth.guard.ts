/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
//import { JwtService } from '@nestjs/jwt';
//import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import {
  auth,
  InvalidTokenError,
  UnauthorizedError,
} from 'express-oauth2-jwt-bearer';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { promisify } from 'util';

// @Injectable()
// @Injectable()
// export class Auth0AuthGuard extends AuthGuard('auth0') {}
@Injectable()
export class Auth0AuthGuard implements CanActivate {
  constructor(
    //private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log(isPublic);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      //const auth0 = ;
      const validateAccessToken = promisify(
        auth({
          audience: this.configService.get('AUTH0_AUDIENCE', ''),
          issuerBaseURL: this.configService.get('AUTH0_ISSUER_BASE_URL', ''),
          //secret: this.configService.get('AUTH0_SECRET', ''),
        }),
      );
      await validateAccessToken(request, response);
      //console.log('payload', payload);
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      //request['admin'] = payload;
    } catch (error) {
      console.log(error);
      if (error instanceof InvalidTokenError) {
        throw new UnauthorizedException('Bad credentials');
      }

      if (error instanceof UnauthorizedError) {
        throw new UnauthorizedException('Requires authentication');
      }
      throw new InternalServerErrorException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
