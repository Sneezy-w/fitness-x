import { request } from '@umijs/max';

/** Get all bookings */
export async function getBookings(options?: Record<string, any>) {
  return request<API.R<API.Service.Booking[]>>('/api/bookings', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/** Get bookings by member ID */
export async function getBookingsByMemberId(
  memberId: number,
  options?: Record<string, any>,
) {
  return request<API.R<API.Service.Booking[]>>(
    `/api/bookings/member/${memberId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...(options || {}),
    },
  );
}

/** Get upcoming bookings for a member */
export async function getMemberUpcomingBookings(
  memberId: number,
  options?: Record<string, any>,
) {
  return request<API.R<API.Service.Booking[]>>(
    `/api/bookings/member/${memberId}/upcoming`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...(options || {}),
    },
  );
}

/** Get bookings by schedule ID */
export async function getBookingsByScheduleId(
  scheduleId: number,
  options?: Record<string, any>,
) {
  return request<API.R<API.Service.Booking[]>>(
    `/api/bookings/schedule/${scheduleId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...(options || {}),
    },
  );
}

/** Get booking by ID */
export async function getBookingById(
  id: number,
  options?: Record<string, any>,
) {
  return request<API.R<API.Service.Booking>>(`/api/bookings/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/** Create a new booking */
export async function createBooking(data: API.Service.CreateBookingRequest) {
  return request<API.R<API.Service.Booking>>('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

/** Update a booking */
export async function updateBooking(
  id: number,
  data: API.Service.UpdateBookingRequest,
) {
  return request<API.R<API.Service.Booking>>(`/api/bookings/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

/** Mark a booking as attended */
export async function markAttendance(id: number) {
  return request<API.R<API.Service.Booking>>(`/api/bookings/${id}/attend`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/** Delete a booking */
export async function deleteBooking(id: number) {
  return request<API.R<any>>(`/api/bookings/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
