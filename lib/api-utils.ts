/**
 * Utilidades para manejar llamadas a la API de manera más robusta
 */

// Opciones por defecto para las solicitudes fetch
const DEFAULT_FETCH_OPTIONS: RequestInit = {
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
}

// Tiempo de espera para solicitudes (en milisegundos)
const REQUEST_TIMEOUT = 1500000 // 15 segundos

/**
 * Realiza una solicitud fetch con manejo de errores y timeout
 */
export async function fetchWithTimeout<T>(url: string, options: RequestInit = {}): Promise<T> {
  // Combinar opciones por defecto con las proporcionadas
  const fetchOptions = {
    ...DEFAULT_FETCH_OPTIONS,
    ...options,
    headers: {
      ...DEFAULT_FETCH_OPTIONS.headers,
      ...options.headers,
    },
  }

  // Crear un controlador de aborto para el timeout
  const controller = new AbortController()
  const { signal } = controller

  // Configurar el timeout
  const timeout = setTimeout(() => {
    controller.abort()
  }, REQUEST_TIMEOUT)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal,
    })

    // Limpiar el timeout
    clearTimeout(timeout)

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      // Intentar obtener detalles del error desde la respuesta
      let errorMessage = `Error ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (e) {
        // Si no se puede parsear como JSON, usar el mensaje por defecto
      }

      const error = new Error(errorMessage)
      ;(error as any).status = response.status
      throw error
    }

    // Para respuestas 204 No Content o solicitudes DELETE exitosas
    if (response.status === 204 || (options.method === "DELETE" && response.status === 200)) {
      return {} as T
    }

    // Parsear la respuesta como JSON
    const data = await response.json()
    return data as T
  } catch (error) {
    // Limpiar el timeout en caso de error
    clearTimeout(timeout)

    // Manejar errores específicos
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("La solicitud ha excedido el tiempo de espera")
    }

    // Re-lanzar el error para que sea manejado por el llamador
    throw error
  }
}

/**
 * Realiza una solicitud GET
 */
export async function apiGet<T>(url: string, options: RequestInit = {}): Promise<T> {
  return fetchWithTimeout<T>(url, {
    ...options,
    method: "GET",
  })
}

/**
 * Realiza una solicitud POST
 */
export async function apiPost<T>(url: string, data: any, options: RequestInit = {}): Promise<T> {
  return fetchWithTimeout<T>(url, {
    ...options,
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * Realiza una solicitud PUT
 */
export async function apiPut<T>(url: string, data: any, options: RequestInit = {}): Promise<T> {
  return fetchWithTimeout<T>(url, {
    ...options,
    method: "PUT",
    body: JSON.stringify(data),
  })
}

/**
 * Realiza una solicitud DELETE
 */
export async function apiDelete<T>(url: string, options: RequestInit = {}): Promise<T> {
  return fetchWithTimeout<T>(url, {
    ...options,
    method: "DELETE",
  })
}

/**
 * Maneja errores de API de manera consistente
 */
export function handleApiError(error: any): { message: string; status?: number } {
  console.error("API Error:", error)

  // Extraer información útil del error
  const status = error.status || (error.response && error.response.status)
  let message = error.message || "Ha ocurrido un error desconocido"

  // Personalizar mensajes según el código de estado
  if (status === 401) {
    message = "No autorizado. Por favor inicie sesión nuevamente."
  } else if (status === 403) {
    message = "No tiene permisos para realizar esta acción."
  } else if (status === 404) {
    message = "El recurso solicitado no fue encontrado."
  } else if (status === 500) {
    message = "Error interno del servidor. Por favor intente más tarde."
  } else if (error.message === "La solicitud ha excedido el tiempo de espera") {
    message = "El servidor está tardando en responder. Por favor intente más tarde."
  } else if (error.name === "TypeError" && error.message.includes("NetworkError")) {
    message = "No se pudo conectar al servidor. Verifique su conexión a internet."
  }

  return { message, status }
}
