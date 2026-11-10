import axios from "axios";

const envApi = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/+$/,
  "",
);

const fallbackApi =
  typeof window !== "undefined" && window.location.origin
    ? `${window.location.origin}/api/v1`
    : "/api/v1";

const normalizedApi = envApi?.endsWith("/api/v1")
  ? envApi
  : envApi
    ? `${envApi}/api/v1`
    : fallbackApi;

export const baseApi = `${normalizedApi}/`;

const axiosInstance = axios.create({
  baseURL: baseApi,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(null);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // ✅ Yeh endpoints refresh trigger nahi karenge - seedha reject
    const skipRefreshUrls = [
      "/auth/check-auth",
      "/user/login",
      " link/generate-onboarding-link",
    ];
    if (skipRefreshUrls.some((url) => originalRequest.url?.includes(url))) {
      return Promise.reject(error); // ✅ redirect nahi, sirf reject
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          originalRequest._retry = true;
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // ✅ check-auth se refresh - naya accessToken cookie mein set hoga
      await axios.get(`${baseApi}auth/check-auth`, {
        withCredentials: true,
      });

      processQueue(null);
      return axiosInstance(originalRequest);
    } catch (refreshError: any) {
      processQueue(refreshError);

      // ✅ Sirf tab redirect karo jab refresh bhi fail ho
      if (refreshError.response?.status === 401) {
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/login";
        }
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
