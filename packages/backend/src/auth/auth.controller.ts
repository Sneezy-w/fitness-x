import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
  Patch,
  //Get,
  //Req,
  //Res,
  //UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
//import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
//import { Auth0AuthGuard } from './guards/auth0-auth.guard';
import { Role } from './enums/role.enum';
import { CreateMemberDto } from 'src/members/dto/create-member.dto';
import { MembersService } from 'src/members/members.service';
import { TrainersService } from 'src/trainers/trainers.service';
import { CreateTrainerDto } from 'src/trainers/dto/create-trainer.dto';
import { Roles } from './decorators/roles.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UpdateMemberProfileDto } from 'src/members/dto/update-member-profile.dto';
//import { UpdateTrainerDto } from 'src/trainers/dto/update-trainer.dto';
import { UpdateTrainerProfileDto } from 'src/trainers/dto/update-trainer-profile.dto';
//import { UpdateTrainerDto } from 'src/trainers/dto/update-trainer.dto';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly membersService: MembersService,
    private readonly trainersService: TrainersService,
  ) {}

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
      phone: member.phone,
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

  @Post('register/member')
  @ApiOperation({ summary: 'Create a new member (public registration)' })
  @ApiResponse({ status: 201, description: 'Member successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  registerMember(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Post('register/trainer')
  @ApiOperation({ summary: 'Create a new trainer (public registration)' })
  @ApiResponse({ status: 201, description: 'Trainer successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  registerTrainer(@Body() createTrainerDto: CreateTrainerDto) {
    return this.trainersService.create(createTrainerDto);
  }

  // @Get('login/admin')
  // @UseGuards(Auth0AuthGuard)
  // @ApiOperation({ summary: 'Admin login via Auth0' })
  // @ApiResponse({ status: 302, description: 'Redirects to Auth0 login page' })
  // async loginAdmin() {
  //   // Auth0 will handle the login logic
  // }

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

  @Get('self/member/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MEMBER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a member by ID' })
  @ApiResponse({ status: 200, description: 'Member details' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  memberProfile(@Req() request: Express.Request) {
    //console.log('id', id);
    //console.log('user', request.user);
    const currentUser = request.user as Express.MemberTrainerUser;
    //console.log('currentUser', currentUser);
    return this.membersService.findOne(currentUser.id);
  }

  @Patch('self/member/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MEMBER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a member' })
  @ApiResponse({ status: 200, description: 'Member updated successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateMemberProfile(
    @Req() request: Express.Request,
    @Body() updateMemberProfileDto: UpdateMemberProfileDto,
  ) {
    const currentUser = request.user as Express.MemberTrainerUser;
    const member = await this.membersService.updateProfile(
      currentUser.id,
      updateMemberProfileDto,
    );
    const token = this.authService.generateJwtToken({
      email: member.email,
      id: member.id.toString(),
      role: Role.MEMBER,
      name: member.full_name,
      phone: member.phone,
    });
    return token;
  }

  @Get('self/trainer/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a trainer by ID' })
  @ApiResponse({ status: 200, description: 'Trainer details' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  trainerProfile(@Req() request: Express.Request) {
    const currentUser = request.user as Express.MemberTrainerUser;
    return this.trainersService.findOne(currentUser.id);
  }

  @Patch('self/trainer/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a trainer' })
  @ApiResponse({ status: 200, description: 'Trainer updated successfully' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  async updateTrainerProfile(
    @Req() request: Express.Request,
    @Body() updateTrainerProfileDto: UpdateTrainerProfileDto,
  ) {
    const currentUser = request.user as Express.MemberTrainerUser;
    const trainer = await this.trainersService.updateProfile(
      currentUser.id,
      updateTrainerProfileDto,
    );
    const token = this.authService.generateJwtToken({
      email: trainer.email,
      id: trainer.id.toString(),
      role: Role.TRAINER,
      name: trainer.full_name,
    });
    return token;
  }
}
