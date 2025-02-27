declare namespace API.Service {
  export interface Member {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }
}
