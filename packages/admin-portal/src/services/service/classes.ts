import { request } from '@umijs/max';

/** Get all active classes */
export async function getClasses(options?: Record<string, any>) {
  return request<API.R<API.Service.Class[]>>('/api/classes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/** Get all classes including inactive ones (admin only) */
export async function getAllClasses(options?: Record<string, any>) {
  return request<API.R<API.Service.Class[]>>('/api/classes/all', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/** Get class by ID */
export async function getClassById(id: number, options?: Record<string, any>) {
  return request<API.R<API.Service.Class>>(`/api/classes/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/** Create a new class (admin only) */
export async function createClass(data: API.Service.CreateClassRequest) {
  return request<API.R<API.Service.Class>>('/api/classes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

/** Update a class (admin only) */
export async function updateClass(
  id: number,
  data: API.Service.UpdateClassRequest,
) {
  return request<API.R<API.Service.Class>>(`/api/classes/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

/** Deactivate a class (admin only) */
export async function deactivateClass(id: number) {
  return request<API.R<API.Service.Class>>(`/api/classes/${id}/deactivate`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/** Activate a class (admin only) */
export async function activateClass(id: number) {
  return request<API.R<API.Service.Class>>(`/api/classes/${id}/activate`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
