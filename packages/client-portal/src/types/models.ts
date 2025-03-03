// Models that match the backend entities

export interface Class {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Trainer {
  id: number;
  email: string;
  full_name: string;
  specialization?: string;
  experience_years?: number;
  is_approved: boolean;
  created_at: string;
}

export interface Schedule {
  id: number;
  class_id: number;
  class: Class;
  trainer_id: number;
  trainer: Trainer;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  is_cancelled: boolean;
  bookings: Booking[];
}

export interface Member {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
  is_active: boolean;
  stripe_customer_id?: string;
}

export interface Booking {
  id: number;
  member_id: number;
  member: Member;
  schedule_id: number;
  schedule: Schedule;
  booked_at: string;
  is_attended: boolean;
  used_free_class: boolean;
}

export interface MembershipType {
  id: number;
  name: string;
  monthly_price: number;
  class_limit: number;
  is_active: boolean;
  //description?: string;
  features?: string[];
}

export interface MembershipSubscription {
  id: number;
  member_id: number;
  member: Member;
  membership_type_id: number;
  membershipType: MembershipType;
  start_date: string;
  end_date: string;
  stripe_subscription_id: string;
  remaining_classes: number;
}

export interface FreeClassAllocation {
  id: number;
  member_id: number;
  member: Member;
  quantity: number;
  created_at: string;
}

export interface PaymentHistory {
  id: number;
  member_id: number;
  member: Member;
  amount: number;
  stripe_payment_id: string;
  payment_date: string;
}

export interface ScheduleDisplayItem extends Schedule {
  availableSpots: number;
  isBooked?: boolean;
}
