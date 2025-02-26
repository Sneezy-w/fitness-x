import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  //Req,
  //Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
//import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Auth0AuthGuard } from './guards/auth0-auth.guard';
import { Role } from './enums/role.enum';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/member')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Member login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async loginMember(@Body() loginDto: LoginDto) {
    const member = await this.authService.validateMember(
      loginDto.email,
      loginDto.password,
    );
    if (!member) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials',
      };
    }
    return this.authService.generateJwtToken({
      email: member.email,
      id: member.id.toString(),
      role: Role.MEMBER,
      name: member.full_name,
    });
  }

  @Post('login/trainer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trainer login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async loginTrainer(@Body() loginDto: LoginDto) {
    const trainer = await this.authService.validateTrainer(
      loginDto.email,
      loginDto.password,
    );
    if (!trainer) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials',
      };
    }
    return this.authService.generateJwtToken({
      email: trainer.email,
      id: trainer.id.toString(),
      role: Role.TRAINER,
      name: trainer.full_name,
    });
  }

  @Get('login/admin')
  @UseGuards(Auth0AuthGuard)
  @ApiOperation({ summary: 'Admin login via Auth0' })
  @ApiResponse({ status: 302, description: 'Redirects to Auth0 login page' })
  async loginAdmin() {
    // Auth0 will handle the login logic
  }

  // @Get('callback')
  // @UseGuards(Auth0AuthGuard)
  // @ApiOperation({ summary: 'Auth0 callback handler' })
  // async callback(@Req() req: any, @Res() res: Response) {
  //   const token = this.authService.generateJwtToken(req.user);
  //   // Redirect to admin dashboard with token
  //   return res.redirect(
  //     `http://localhost:5173/admin/dashboard?token=${token.access_token}`,
  //   );
  // }
}
