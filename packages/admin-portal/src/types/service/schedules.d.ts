declare namespace API.Service {
  export interface Schedule {
    id: number;
    class_id: number;
    trainer_id: number;
    date: string;
    start_time: string;
    end_time: string;
    capacity: number;
    is_cancelled: boolean;
    created_at: string;
    updated_at: string;
    class?: Class;
    trainer?: Trainer;
    bookings?: Booking[];
  }

  export interface CreateScheduleRequest {
    class_id: number;
    trainer_id: number;
    date: string;
    start_time: string;
    end_time: string;
    capacity: number;
    is_cancelled?: boolean;
  }

  export interface UpdateScheduleRequest {
    class_id?: number;
    trainer_id?: number;
    date?: string;
    start_time?: string;
    end_time?: string;
    capacity?: number;
    is_cancelled?: boolean;
  }
}
