import { request } from '@umijs/max';

/** Get all subscriptions (admin only) */
export async function getMembershipSubscriptions(
  options?: Record<string, any>,
) {
  return request<API.R<API.Service.MembershipSubscription[]>>(
    '/api/membership-subscriptions',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...(options || {}),
    },
  );
}

/** Get subscriptions for a specific member */
export async function getMemberSubscriptions(
  memberId: number,
  options?: Record<string, any>,
) {
  return request<API.R<API.Service.MembershipSubscription[]>>(
    `/api/membership-subscriptions/member/${memberId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...(options || {}),
    },
  );
}

/** Get current active subscription for a member */
export async function getCurrentMemberSubscription(
  memberId: number,
  options?: Record<string, any>,
) {
  return request<API.R<API.Service.MembershipSubscription>>(
    `/api/membership-subscriptions/member/${memberId}/current`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...(options || {}),
    },
  );
}

/** Get subscription by ID */
export async function getMembershipSubscriptionById(
  id: number,
  options?: Record<string, any>,
) {
  return request<API.R<API.Service.MembershipSubscription>>(
    `/api/membership-subscriptions/${id}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...(options || {}),
    },
  );
}

/** Create a new subscription (admin only) */
export async function createMembershipSubscription(
  data: API.Service.CreateMembershipSubscriptionRequest,
) {
  return request<API.R<API.Service.MembershipSubscription>>(
    '/api/membership-subscriptions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data,
    },
  );
}

/** Update a subscription (admin only) */
export async function updateMembershipSubscription(
  id: number,
  data: API.Service.UpdateMembershipSubscriptionRequest,
) {
  return request<API.R<API.Service.MembershipSubscription>>(
    `/api/membership-subscriptions/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      data,
    },
  );
}

/** Delete a subscription (admin only) */
export async function deleteMembershipSubscription(id: number) {
  return request<API.R<any>>(`/api/membership-subscriptions/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/** Decrement remaining classes for a subscription */
export async function decrementSubscriptionClasses(id: number) {
  return request<API.R<API.Service.MembershipSubscription>>(
    `/api/membership-subscriptions/${id}/decrement-classes`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}
