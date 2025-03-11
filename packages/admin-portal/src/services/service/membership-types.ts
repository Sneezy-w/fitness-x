import { request } from '@umijs/max';

/** Get all active membership types */
export async function getMembershipTypes(options?: Record<string, any>) {
  return request<API.R<API.Service.MembershipType[]>>('/membership-types', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/** Get all membership types including deleted ones (admin only) */
export async function getAllMembershipTypes(options?: Record<string, any>) {
  return request<API.R<API.Service.MembershipType[]>>('/membership-types/all', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/** Get membership type by ID */
export async function getMembershipTypeById(
  id: number,
  options?: Record<string, any>,
) {
  return request<API.R<API.Service.MembershipType>>(`/membership-types/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/** Create a new membership type (admin only) */
export async function createMembershipType(
  data: API.Service.CreateMembershipTypeRequest,
) {
  return request<API.R<API.Service.MembershipType>>('/membership-types', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

/** Update a membership type (admin only) */
export async function updateMembershipType(
  id: number,
  data: API.Service.UpdateMembershipTypeRequest,
) {
  return request<API.R<API.Service.MembershipType>>(`/membership-types/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

/** Soft delete a membership type (admin only) */
export async function deleteMembershipType(id: number) {
  return request<API.R<any>>(`/membership-types/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/** Restore a deleted membership type (admin only) */
export async function restoreMembershipType(id: number) {
  return request<API.R<API.Service.MembershipType>>(
    `/membership-types/${id}/restore`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}
