import api from "./api";
import { Schedule, Booking, Class, Trainer } from "../types/models";

// Calculate available spots for a schedule
const calculateAvailableSpots = (schedule: Schedule): number => {
  if (!schedule.bookings) return schedule.capacity;
  return schedule.capacity - schedule.bookings.length;
};

// Function to fetch all active classes
export const fetchClasses = async (): Promise<Class[]> => {
  const response = await api.get("/classes");
  return response.data;
};

// Function to fetch all trainers
export const fetchTrainers = async (): Promise<Trainer[]> => {
  const response = await api.get("/trainers");
  return response.data;
};

// Function to fetch schedules
export const fetchSchedules = async (params?: {
  date?: string;
  classId?: number;
  trainerId?: number;
}): Promise<Schedule[]> => {
  const response = await api.get("/schedules", { params });
  return response.data;
};

// Function to fetch schedules with availability data
export const fetchSchedulesWithAvailability = async (params?: {
  date?: string;
  classId?: number;
  trainerId?: number;
}): Promise<(Schedule & { availableSpots: number })[]> => {
  const schedules = await fetchSchedules(params);
  return schedules.map((schedule) => ({
    ...schedule,
    availableSpots: calculateAvailableSpots(schedule),
  }));
};

// Function to fetch member's bookings
export const fetchMemberBookings = async (): Promise<Booking[]> => {
  const response = await api.get("/bookings/member");
  return response.data;
};

// Function to book a class
export const bookClass = async (
  scheduleId: number,
  useFreeClass: boolean = false
): Promise<Booking> => {
  const response = await api.post("/bookings", {
    schedule_id: scheduleId,
    used_free_class: useFreeClass,
  });
  return response.data;
};

// Function to cancel a booking
export const cancelBooking = async (bookingId: number): Promise<void> => {
  await api.delete(`/bookings/${bookingId}`);
};

// Function to check if a member has booked a specific schedule
export const hasBookedSchedule = async (
  scheduleId: number
): Promise<boolean> => {
  const bookings = await fetchMemberBookings();
  return bookings.some((booking) => booking.schedule_id === scheduleId);
};

// Function to get schedules with booking status for the current member
export const fetchSchedulesWithBookingStatus = async (params?: {
  date?: string;
  classId?: number;
  trainerId?: number;
}): Promise<(Schedule & { availableSpots: number; isBooked: boolean })[]> => {
  const [schedules, bookings] = await Promise.all([
    fetchSchedules(params),
    fetchMemberBookings(),
  ]);

  const bookedScheduleIds = bookings.map((booking) => booking.schedule_id);

  return schedules.map((schedule) => ({
    ...schedule,
    availableSpots: calculateAvailableSpots(schedule),
    isBooked: bookedScheduleIds.includes(schedule.id),
  }));
};
