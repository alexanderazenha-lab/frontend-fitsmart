import axios from "axios";
import { router } from "expo-router";
import { getToken, removeToken } from "./storage";

// Exportação nomeada e default para compatibilidade total de imports
export const api = axios.create({
  baseURL: "http://localhost:8082", // Emulador Android: 10.0.2.2 | Dispositivo físico: IP local
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de Requisição: adiciona o token JWT em cada chamada
api.interceptors.request.use(
  async (config) => {
    // Lista de rotas públicas mapeadas no SecurityConfig.java
    const isPublicRoute =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/") ||
      (config.url?.includes("/professors") && config.method?.toUpperCase() === "POST");
    (config.url?.includes("/students") && config.method?.toUpperCase() === "POST");
    if (isPublicRoute) {
      return config;
    }

    const token = await getToken();
    console.log("🔑 [DEBUG] Token no Storage:", token);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(
        "⚠️ [DEBUG] Nenhum token encontrado para rota protegida.",
      );
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor de Resposta: trata tokens expirados ou inválidos (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn(
        "⚠️ [DEBUG] Sessão expirada ou não autorizada. Limpando token...",
      );
      await removeToken();
      router.replace("/login");
    }
    return Promise.reject(error);
  },
);

export default api;
