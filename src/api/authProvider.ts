import { AuthBindings } from "@refinedev/core";
import { notification } from "antd";
import { AxiosInstance } from "axios";
import { axiosInstance } from "../utils";

export const TOKEN_KEY = "suns-auth-token";

const httpClient: AxiosInstance = axiosInstance;
// const API_BASE_URL = import.meta.env.VITE_BACKEND_API_AUTH_URL;
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_LOCAL_AUTH_URL;

export const authProvider: AuthBindings = {
  login: async ({ email, password }) => {
    const response = await httpClient.post(`${API_BASE_URL}/login`, {
      email,
      password,
    });
    console.log(response);

    localStorage.setItem(TOKEN_KEY, `${email}-${password}`);
    return {
      success: false,
      redirectTo: "/",
    };
  },
  register: async ({ email, password }) => {
    try {
      await authProvider.login({ email, password });
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: "Register failed",
          name: "Invalid email or password",
        },
      };
    }
  },
  updatePassword: async () => {
    notification.success({
      message: "Updated Password",
      description: "Password updated successfully",
    });
    return {
      success: true,
    };
  },
  forgotPassword: async ({ email }) => {
    notification.success({
      message: "Reset Password",
      description: `Reset password link sent to "${email}"`,
    });
    return {
      success: true,
    };
  },
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      error: {
        message: "Check failed",
        name: "Token not found",
      },
      logout: true,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }

    return {
      id: 1,
      name: "James Sullivan",
      avatar: "https://i.pravatar.cc/150",
    };
  },
};
