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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    //console.log("response", response);
    if (response.data?.data?.success === false) {
      throw new Error(response.data.data.errorMessage);
    }
    return response.data;
  },
  (error) => {
    const { response } = error;

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
