import { request } from '@umijs/max';

/**
 * Get all schedules
 */
export async function getSchedules() {
  return request<API.R<API.Service.Schedule[]>>('/api/schedules', {
    method: 'GET',
  });
}

/**
 * Get schedule by ID
 */
export async function getScheduleById(id: number) {
  return request<API.R<API.Service.Schedule>>(`/api/schedules/${id}`, {
    method: 'GET',
  });
}

/**
 * Create a new schedule
 */
export async function createSchedule(data: API.Service.CreateScheduleRequest) {
  return request<API.R<API.Service.Schedule>>('/api/schedules', {
    method: 'POST',
    data,
  });
}

/**
 * Update a schedule
 */
export async function updateSchedule(
  id: number,
  data: API.Service.UpdateScheduleRequest,
) {
  return request<API.R<API.Service.Schedule>>(`/api/schedules/${id}`, {
    method: 'PATCH',
    data,
  });
}

/**
 * Delete a schedule
 */
export async function deleteSchedule(id: number) {
  return request<API.R<void>>(`/api/schedules/${id}`, {
    method: 'DELETE',
  });
}

/** Get upcoming schedules */
export async function getUpcomingSchedules(options?: Record<string, any>) {
  return request<API.R<API.Service.Schedule[]>>(
    '/api/schedules/public/upcoming',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...(options || {}),
    },
  );
}

/** Get schedules by date range */
export async function getSchedulesByDateRange(
  startDate: string,
  endDate: string,
  options?: Record<string, any>,
) {
  return request<API.R<API.Service.Schedule[]>>(
    `/api/schedules/range?startDate=${startDate}&endDate=${endDate}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...(options || {}),
    },
  );
}

/** Get schedules by class ID */
export async function getSchedulesByClassId(
  classId: number,
  options?: Record<string, any>,
) {
  return request<API.R<API.Service.Schedule[]>>(
    `/api/schedules/class/${classId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...(options || {}),
    },
  );
}

/** Get schedules by trainer ID */
export async function getSchedulesByTrainerId(
  trainerId: number,
  options?: Record<string, any>,
) {
  return request<API.R<API.Service.Schedule[]>>(
    `/api/schedules/trainer/${trainerId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...(options || {}),
    },
  );
}

/** Cancel a schedule (admin only) */
export async function cancelSchedule(id: number) {
  return request<API.R<API.Service.Schedule>>(`/api/schedules/${id}/cancel`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
