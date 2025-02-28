import { Role } from '../auth/enums/role.enum';

declare global {
  namespace Express {
    export interface MemberTrainerUser extends Express.User {
      id: number;
      email: string;
      role: Role.MEMBER | Role.TRAINER;
    }
    interface Request extends Express.Request {
      user?: MemberTrainerUser;
    }
  }
}
