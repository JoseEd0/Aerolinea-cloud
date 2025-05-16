// Configuración centralizada para las APIs
export const API_CONFIG = {
  // URLs base de los microservicios
  URLS: {
    MICROSERVICIO1: "http://3.93.177.171:8082",
    MICROSERVICIO2: "http://3.93.177.171:8080",
    MICROSERVICIO3: "http://3.93.177.171:8081",
  },

  // Opciones comunes para las solicitudes fetch
  FETCH_OPTIONS: {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: "no-cache" as RequestCache,
    mode: "cors" as RequestMode,
    credentials: "same-origin" as RequestCredentials,
  },

  // Tiempo de espera para las solicitudes (en milisegundos)
  TIMEOUT: 1000000,

  // Número de reintentos para solicitudes fallidas
  MAX_RETRIES: 2,

  // Tiempo de espera entre reintentos (en milisegundos)
  RETRY_DELAY: 1000,
}

// URL base para todas las APIs
export const API_BASE_URL = "http://3.93.177.171:8082"

// Función para crear una solicitud con reintentos
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = API_CONFIG.MAX_RETRIES,
): Promise<Response> {
  let lastError: Error

  for (let i = 0; i <= maxRetries; i++) {
    try {
      // Agregar timeout a las opciones
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`)
      }

      return response
    } catch (error) {
      console.error(`Intento ${i + 1}/${maxRetries + 1} fallido:`, error)
      lastError = error as Error

      if (i < maxRetries) {
        // Esperar antes de reintentar
        await new Promise((resolve) => setTimeout(resolve, API_CONFIG.RETRY_DELAY))
      }
    }
  }

  throw lastError!
}
