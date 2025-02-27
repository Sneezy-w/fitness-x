declare namespace API.Service {
  export interface Booking {
    id: number;
    member_id: number;
    schedule_id: number;
    booked_at: string;
    is_attended: boolean;
    used_free_class: boolean;
    member?: Member;
    schedule?: Schedule;
    status: 'confirmed' | 'cancelled' | 'attended';
  }

  export interface CreateBookingRequest {
    member_id: number;
    schedule_id: number;
    is_attended?: boolean;
    used_free_class?: boolean;
  }

  export interface UpdateBookingRequest {
    is_attended?: boolean;
    used_free_class?: boolean;
    status?: 'confirmed' | 'cancelled' | 'attended';
  }
}
