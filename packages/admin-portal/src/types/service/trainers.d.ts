declare namespace API.Service {
  export interface Trainer {
    id: number;
    email: string;
    full_name: string;
    specialization: string;
    experience_years: number;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface CreateTrainerRequest {
    email: string;
    password: string;
    full_name: string;
    specialization?: string;
    experience_years?: number;
  }

  export interface UpdateTrainerRequest {
    email?: string;
    full_name?: string;
    specialization?: string;
    experience_years?: number;
  }
}
