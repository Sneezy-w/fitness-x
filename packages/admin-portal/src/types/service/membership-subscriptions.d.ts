declare namespace API.Service {
  export interface MembershipSubscription {
    id: number;
    member_id: number;
    membership_type_id: number;
    start_date: string;
    end_date: string;
    remaining_classes: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    membership_type?: MembershipType;
    member?: Member;
  }

  export interface CreateMembershipSubscriptionRequest {
    member_id: number;
    membership_type_id: number;
    start_date: string;
    end_date?: string;
    remaining_classes?: number;
  }

  export interface UpdateMembershipSubscriptionRequest {
    start_date?: string;
    end_date?: string;
    remaining_classes?: number;
    is_active?: boolean;
  }
}
