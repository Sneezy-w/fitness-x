import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

type UserRole = "member" | "trainer";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface DecodedToken {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  exp: number;
}

// Types for registration data
interface RegisterData {
  name: string;
  email: string;
  password: string;
  [key: string]: string | number | boolean; // For additional fields
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (userData: RegisterData, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on load
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const decoded = jwtDecode<DecodedToken>(storedToken);

          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            setUser(null);
          } else {
            // Set user from token
            setUser({
              id: decoded.sub,
              email: decoded.email,
              name: decoded.name,
              role: decoded.role,
            });

            // Set authorization header for all requests
            api.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${storedToken}`;
          }
        } catch {
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const endpoint =
        role === "member" ? "/auth/login/member" : "/auth/login/trainer";
      const response = await api.post(endpoint, { email, password });
      console.log("response", response);
      const { access_token: token } = response.data;

      localStorage.setItem("token", token);
      //api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const decoded = jwtDecode<DecodedToken>(token);
      setUser({
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData, role: UserRole) => {
    setIsLoading(true);
    try {
      const endpoint =
        role === "member" ? "/auth/register/member" : "/auth/register/trainer";
      await api.post(endpoint, userData);
      // Note: We don't automatically log in after registration
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
