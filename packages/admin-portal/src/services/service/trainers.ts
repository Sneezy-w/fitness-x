import { request } from '@umijs/max';

/**
 * Get all trainers
 */
export async function getTrainers() {
  return request<API.R<API.Service.Trainer[]>>('/api/trainers', {
    method: 'GET',
  });
}

/**
 * Get trainer by ID
 */
export async function getTrainerById(id: number) {
  return request<API.R<API.Service.Trainer>>(`/api/trainers/${id}`, {
    method: 'GET',
  });
}

/**
 * Create a new trainer
 */
export async function createTrainer(data: API.Service.CreateTrainerRequest) {
  return request<API.R<API.Service.Trainer>>('/api/trainers', {
    method: 'POST',
    data,
  });
}

/**
 * Update a trainer
 */
export async function updateTrainer(
  id: number,
  data: API.Service.UpdateTrainerRequest,
) {
  return request<API.R<API.Service.Trainer>>(`/api/trainers/${id}`, {
    method: 'PATCH',
    data,
  });
}

/**
 * Delete a trainer
 */
export async function deleteTrainer(id: number) {
  return request<API.R<void>>(`/api/trainers/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Approve a trainer
 */
export async function approveTrainer(id: number) {
  return request<API.R<API.Service.Trainer>>(`/api/trainers/${id}/approve`, {
    method: 'PATCH',
  });
}
