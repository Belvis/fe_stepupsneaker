import { HttpError } from "@refinedev/core";
import axios from "axios";

const axiosInstance = axios.create();

axiosInstance.defaults.headers.common["Content-Type"] = "application/json";

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("suns-auth-token");
    if (config?.headers) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      config.headers["Accept-Language"] = "vi";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const customError: HttpError = {
      ...error,
      message: error.response?.data?.errors,
      statusCode: error.response?.data.status,
    };

    return Promise.reject(customError);
  }
);

export { axiosInstance };
