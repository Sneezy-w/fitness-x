import { request } from '@umijs/max';

/** Get statistics for the dashboard */
export async function getStatistics(options?: Record<string, any>) {
  return request<API.R<any>>('/statistics/dashboard', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/** Export attendance data */
export async function exportAttendance(options?: Record<string, any>) {
  return request('/statistics/export-attendance', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}
