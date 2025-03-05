import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MembersService } from '../members/members.service';
import { TrainersService } from '../trainers/trainers.service';
import { Role } from './enums/role.enum';
import { ApiException } from '../common/exceptions/api.exception';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private membersService: MembersService,
    private trainersService: TrainersService,
  ) {}

  async validateMember(email: string, password: string) {
    const member = await this.membersService.validateMember(email, password);
    if (member) {
      return { ...member, role: Role.MEMBER };
    }
    throw new ApiException('Invalid credentials');
  }

  async validateTrainer(email: string, password: string) {
    const trainer = await this.trainersService.validateTrainer(email, password);
    if (trainer) {
      return { ...trainer, role: Role.TRAINER };
    }
    throw new ApiException('Invalid credentials');
  }

  generateJwtToken(user: {
    email: string;
    id: string;
    role: Role;
    name: string;
    phone?: string;
  }) {
    const payload = {
      email: user.email,
      sub: user.id,
      name: user.name,
      role: user.role,
      ...(user.phone && { phone: user.phone }),
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
