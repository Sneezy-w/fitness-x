/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { MembersService } from '../members/members.service';
import { TrainersService } from '../trainers/trainers.service';
import { Role } from './enums/role.enum';
import { ApiException } from '../common/exceptions/api.exception';
import { Member } from '../members/entities/member.entity';
import { Trainer } from '../trainers/entities/trainer.entity';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let membersService: MembersService;
  let trainersService: TrainersService;

  // Mock data
  const mockMember = {
    id: 1,
    email: 'member@example.com',
    full_name: 'Test Member',
    phone: '1234567890',
  };

  const mockTrainer = {
    id: 2,
    email: 'trainer@example.com',
    full_name: 'Test Trainer',
  };

  const mockJwtToken = 'mock.jwt.token';

  beforeEach(async () => {
    // Create a mock module with our service and its dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue(mockJwtToken),
          },
        },
        {
          provide: MembersService,
          useValue: {
            validateMember: jest.fn(),
          },
        },
        {
          provide: TrainersService,
          useValue: {
            validateTrainer: jest.fn(),
          },
        },
      ],
    }).compile();

    // Get instances of the service and its dependencies
    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    membersService = module.get<MembersService>(MembersService);
    trainersService = module.get<TrainersService>(TrainersService);
  });

  // Tests for service instantiation
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Unit tests for validateMember method
  describe('validateMember', () => {
    it('should return member with role when validation is successful', async () => {
      jest
        .spyOn(membersService, 'validateMember')
        .mockResolvedValue(mockMember as Member);

      const result = await service.validateMember(
        'member@example.com',
        'password',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(membersService.validateMember).toHaveBeenCalledWith(
        'member@example.com',
        'password',
      );
      expect(result).toEqual({ ...mockMember, role: Role.MEMBER });
    });

    it('should throw ApiException when validation fails', async () => {
      jest.spyOn(membersService, 'validateMember').mockResolvedValue(null);

      await expect(
        service.validateMember('wrong@example.com', 'wrongpass'),
      ).rejects.toThrow(ApiException);
      expect(membersService.validateMember).toHaveBeenCalledWith(
        'wrong@example.com',
        'wrongpass',
      );
    });
  });

  // Unit tests for validateTrainer method
  describe('validateTrainer', () => {
    it('should return trainer with role when validation is successful', async () => {
      jest
        .spyOn(trainersService, 'validateTrainer')
        .mockResolvedValue(mockTrainer as Trainer);

      const result = await service.validateTrainer(
        'trainer@example.com',
        'password',
      );

      expect(trainersService.validateTrainer).toHaveBeenCalledWith(
        'trainer@example.com',
        'password',
      );
      expect(result).toEqual({ ...mockTrainer, role: Role.TRAINER });
    });

    it('should throw ApiException when validation fails', async () => {
      jest.spyOn(trainersService, 'validateTrainer').mockResolvedValue(null);

      await expect(
        service.validateTrainer('wrong@example.com', 'wrongpass'),
      ).rejects.toThrow(ApiException);
      expect(trainersService.validateTrainer).toHaveBeenCalledWith(
        'wrong@example.com',
        'wrongpass',
      );
    });
  });

  // Unit tests for generateJwtToken method
  describe('generateJwtToken', () => {
    it('should generate a token for a member user', () => {
      const user = {
        email: mockMember.email,
        id: mockMember.id.toString(),
        role: Role.MEMBER,
        name: mockMember.full_name,
        phone: mockMember.phone,
      };

      const result = service.generateJwtToken(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
        name: user.name,
        role: user.role,
        phone: user.phone,
      });
      expect(result).toEqual({ access_token: mockJwtToken });
    });

    it('should generate a token for a trainer user', () => {
      const user = {
        email: mockTrainer.email,
        id: mockTrainer.id.toString(),
        role: Role.TRAINER,
        name: mockTrainer.full_name,
      };

      const result = service.generateJwtToken(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
        name: user.name,
        role: user.role,
      });
      expect(result).toEqual({ access_token: mockJwtToken });
    });

    it('should not include phone field if phone is not provided', () => {
      const user = {
        email: 'test@example.com',
        id: '3',
        role: Role.MEMBER,
        name: 'Test User',
      };

      service.generateJwtToken(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
        name: user.name,
        role: user.role,
      });
    });
  });
});
