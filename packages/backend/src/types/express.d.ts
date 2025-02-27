import { Role } from '../auth/enums/role.enum';

export interface User {
  id: string;
  email: string;
  role: Role.MEMBER | Role.TRAINER;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
