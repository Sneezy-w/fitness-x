declare namespace API.Service {
  export interface Class {
    id: number;
    name: string;
    description: string;
    //duration: number;
    //capacity: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    //deleted_at: string | null;
    trainer?: Trainer;
    schedules?: Schedule[];
  }

  // export interface Trainer {
  //   id: number;
  //   full_name: string;
  //   email: string;
  //   phone: string;
  //   specialization: string;
  //   is_active: boolean;
  //   created_at: string;
  //   updated_at: string;
  // }

  export interface CreateClassRequest {
    name: string;
    description: string;
    //duration: number;
    //capacity: number;
    is_active?: boolean;
  }

  export interface UpdateClassRequest {
    name?: string;
    description?: string;
    //duration?: number;
    //capacity?: number;
    is_active?: boolean;
  }
}
