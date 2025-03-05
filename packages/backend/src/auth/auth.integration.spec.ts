import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { MembersService } from '../members/members.service';
import { TrainersService } from '../trainers/trainers.service';
import { Role } from './enums/role.enum';
import { ApiException } from '../common/exceptions/api.exception';

describe('AuthService Integration', () => {
  let authService: AuthService;
  //let membersService: MembersService;
  //let trainersService: TrainersService;
  let module: TestingModule;

  // Mock members and trainers services for the integration test
  const mockMembersService = {
    validateMember: jest.fn(),
  };

  const mockTrainersService = {
    validateTrainer: jest.fn(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        // Use the real JWT module with test configurations
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET', 'test-secret'),
            signOptions: { expiresIn: '1h' },
          }),
        }),
        ConfigModule.forRoot({
          isGlobal: true,
          // Use a test configuration
          envFilePath: '.env.test',
        }),
      ],
      providers: [
        AuthService,
        {
          provide: MembersService,
          useValue: mockMembersService,
        },
        {
          provide: TrainersService,
          useValue: mockTrainersService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    //membersService = module.get<MembersService>(MembersService);
    //trainersService = module.get<TrainersService>(TrainersService);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  // Test the complete member authentication flow
  describe('Member Authentication Flow', () => {
    it('should authenticate a member and return a valid JWT token', async () => {
      const mockMember = {
        id: 1,
        email: 'member@example.com',
        full_name: 'Test Member',
        phone: '1234567890',
      };

      // Mock the member validation
      mockMembersService.validateMember.mockResolvedValue(mockMember);

      // Validate the member
      const validatedMember = await authService.validateMember(
        'member@example.com',
        'password123',
      );

      // Generate token
      const tokenResult = authService.generateJwtToken({
        email: validatedMember.email,
        id: validatedMember.id.toString(),
        role: validatedMember.role,
        name: validatedMember.full_name,
        phone: validatedMember.phone,
      });

      // Assertions
      expect(validatedMember).toBeDefined();
      expect(validatedMember.role).toBe(Role.MEMBER);
      expect(tokenResult.access_token).toBeDefined();
      expect(typeof tokenResult.access_token).toBe('string');
    });

    it('should throw an exception when member credentials are invalid', async () => {
      // Mock validation failure
      mockMembersService.validateMember.mockResolvedValue(null);

      // Attempt to validate with incorrect credentials
      await expect(
        authService.validateMember('wrong@example.com', 'wrongpass'),
      ).rejects.toThrow(ApiException);
    });
  });

  // Test the complete trainer authentication flow
  describe('Trainer Authentication Flow', () => {
    it('should authenticate a trainer and return a valid JWT token', async () => {
      const mockTrainer = {
        id: 2,
        email: 'trainer@example.com',
        full_name: 'Test Trainer',
      };

      // Mock the trainer validation
      mockTrainersService.validateTrainer.mockResolvedValue(mockTrainer);

      // Validate the trainer
      const validatedTrainer = await authService.validateTrainer(
        'trainer@example.com',
        'password123',
      );

      // Generate token
      const tokenResult = authService.generateJwtToken({
        email: validatedTrainer.email,
        id: validatedTrainer.id.toString(),
        role: validatedTrainer.role,
        name: validatedTrainer.full_name,
      });

      // Assertions
      expect(validatedTrainer).toBeDefined();
      expect(validatedTrainer.role).toBe(Role.TRAINER);
      expect(tokenResult.access_token).toBeDefined();
      expect(typeof tokenResult.access_token).toBe('string');
    });

    it('should throw an exception when trainer credentials are invalid', async () => {
      // Mock validation failure
      mockTrainersService.validateTrainer.mockResolvedValue(null);

      // Attempt to validate with incorrect credentials
      await expect(
        authService.validateTrainer('wrong@example.com', 'wrongpass'),
      ).rejects.toThrow(ApiException);
    });
  });
});
