// Re-export all services from a single file
import api from "./api";

export { api };
export * from "./scheduleService";
export * from "./membershipService";

// Authentication service
export const login = async (
  email: string,
  password: string
): Promise<{ token: string }> => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const register = async (
  email: string,
  password: string,
  fullName: string,
  phone?: string
): Promise<{ token: string }> => {
  const response = await api.post("/auth/register", {
    email,
    password,
    full_name: fullName,
    phone,
  });
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem("token");
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token");
};
