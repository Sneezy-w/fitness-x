import axios from "axios";
import toast from "react-hot-toast";

// Create axios instance with base URL
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Mock response data for development/fallback
const mockResponses: Record<string, any> = {
  '/bookings/member': [
    {
      id: 1,
      schedule_id: 1,
      member_id: 1,
      status: 'confirmed',
      attendance_status: 'pending',
      created_at: '2023-03-01T00:00:00.000Z',
      updated_at: '2023-03-01T00:00:00.000Z',
      schedule: {
        id: 1,
        class_id: 1,
        trainer_id: 1,
        date: '2023-03-15',
        start_time: '10:00',
        end_time: '11:00',
        capacity: 20,
        is_cancelled: false,
        created_at: '2023-03-01T00:00:00.000Z',
        updated_at: '2023-03-01T00:00:00.000Z',
        class: {
          id: 1,
          name: 'Yoga Class',
          description: 'Relaxing yoga session',
          category: 'Yoga Studio',
          duration_minutes: 60
        },
        trainer: {
          id: 1,
          first_name: 'John',
          last_name: 'Doe'
        }
      }
    }
  ],
  '/schedules/available': [
    {
      id: 1,
      class_id: 1,
      trainer_id: 1,
      date: '2023-03-15',
      start_time: '10:00',
      end_time: '11:00',
      capacity: 20,
      is_cancelled: false,
      created_at: '2023-03-01T00:00:00.000Z',
      updated_at: '2023-03-01T00:00:00.000Z',
      isBooked: false,
      class: {
        id: 1,
        name: 'Yoga Class',
        description: 'Relaxing yoga session',
        category: 'Yoga Studio',
        duration_minutes: 60
      },
      trainer: {
        id: 1,
        first_name: 'John',
        last_name: 'Doe'
      },
      bookings: []
    }
  ],
  '/membership-subscriptions/member/current': {
    id: 1,
    member_id: 1,
    membership_type_id: 1,
    start_date: '2023-03-01',
    end_date: '2023-04-01',
    status: 'active',
    payment_status: 'paid',
    remainingClasses: 10,
    created_at: '2023-03-01T00:00:00.000Z',
    updated_at: '2023-03-01T00:00:00.000Z'
  },
  '/free-class-allocations/member/current/remaining': {
    remainingClasses: 2
  }
};

// Enhanced response interceptor with mock fallbacks
api.interceptors.response.use(
  (response) => {
    // NestJS typically returns data directly, no success field
    return response.data;
  },
  (error) => {
    const { response, config } = error;
    
    // If we're in a development environment and have a mock for this endpoint, return it
    if (import.meta.env.DEV && config?.url) {
      const mockData = mockResponses[config.url as string];
      if (mockData) {
        console.warn(`Using mock data for ${config.url} as backend request failed`);
        return mockData;
      }
    }

    if (response) {
      // Handle unauthorized errors
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/auth";
        toast.error("Your session has expired. Please login again.");
      }
      // Handle forbidden errors
      else if (response.status === 403) {
        toast.error("You do not have permission to access this resource.");
      }
      // Handle other errors
      else {
        const errorMessage =
          response.data?.message ||
          "An error occurred. Please try again later.";
        toast.error(errorMessage);
      }
    } else {
      toast.error("Network error. Please check your connection and try again.");
    }

    return Promise.reject(error);
  }
);

export default api;
