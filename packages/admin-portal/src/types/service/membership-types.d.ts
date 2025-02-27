declare namespace API.Service {
  export interface MembershipType {
    id: number;
    name: string;
    monthly_price: string;
    class_limit: number;
    is_active: boolean;
    deleted_at: string | null;
    //created_at: string;
    //updated_at: string;
  }

  export interface CreateMembershipTypeRequest {
    name: string;
    monthly_price: number;
    class_limit: number;
  }

  export interface UpdateMembershipTypeRequest {
    name?: string;
    monthly_price?: number;
    class_limit?: number;
  }
}
