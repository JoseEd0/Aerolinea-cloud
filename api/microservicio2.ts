import { API_CONFIG, fetchWithRetry } from "@/lib/api-config"

const API_URL = API_CONFIG.URLS.MICROSERVICIO2

// Tipos
export interface YearManufacture {
  value: number
  leap: boolean
}

export interface Plane {
  id?: number
  model: string
  capacity: number
  year_manufacture: YearManufacture
}

export interface Pilot {
  id?: number
  name: string
  gender: string
  birthDate: string
}

export interface Flight {
  id?: number
  planeDto?: Plane
  pilotDto?: Pilot
  origin: string
  destination: string
  departure: string
  arrival: string
}

export interface FlightCreate {
  idPlane: number
  idPilot: number
  origin: string
  destination: string
  departure: string
  arrival: string
}

// Caché para almacenar resultados
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Función para obtener datos con caché
async function fetchWithCache<T>(
  url: string,
  options: RequestInit,
  cacheKey: string,
  page = 1,
  limit = 10,
): Promise<T> {
  const fullCacheKey = `${cacheKey}-${page}-${limit}`
  const now = Date.now()
  const cachedData = cache.get(fullCacheKey)

  if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data as T
  }

  try {
    const response = await fetchWithRetry(url, options)
    const data = await response.json()

    // Almacenar en caché
    cache.set(fullCacheKey, { data, timestamp: now })

    return data
  } catch (error) {
    console.error("Error en fetchWithCache:", error)
    throw error
  }
}

export async function getPlanes(page = 0, size = 10): Promise<Plane[]> {
  try {
    const response = await fetchWithRetry(
      `${API_URL}/plane/paged?page=${page}&size=${size}`,
      {
        method: "GET",
        ...API_CONFIG.FETCH_OPTIONS,
      }
    )
    const data = await response.json()
    // Si la respuesta tiene la propiedad 'content', retorna eso
    return data.content ?? data
  } catch (error) {
    console.error("Error detallado al obtener aviones:", error)
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      throw new Error(
        "No se pudo conectar con el servidor. Verifique su conexión a internet o si el servidor está disponible.",
      )
    }
    throw error
  }
}


export async function getPlane(id: number): Promise<Plane> {
  try {
    const cacheKey = `plane-${id}`
    const now = Date.now()
    const cachedData = cache.get(cacheKey)

    if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data as Plane
    }

    const response = await fetchWithRetry(`${API_URL}/plane/${id}`, {
      method: "GET",
      ...API_CONFIG.FETCH_OPTIONS,
    })

    const data = await response.json()
    cache.set(cacheKey, { data, timestamp: now })

    return data
  } catch (error) {
    console.error(`Error al obtener avión con ID ${id}:`, error)
    throw error
  }
}

export async function createPlane(plane: Omit<Plane, "id">): Promise<Plane> {
  try {
    const response = await fetchWithRetry(`${API_URL}/plane`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(plane),
    })

    // Invalidar caché de aviones
    Array.from(cache.keys())
      .filter((key) => key.startsWith("plane"))
      .forEach((key) => cache.delete(key))

    return await response.json()
  } catch (error) {
    console.error("Error al crear avión:", error)
    throw error
  }
}

export async function updatePlane(id: number, plane: Omit<Plane, "id">): Promise<Plane> {
  try {
    const response = await fetchWithRetry(`${API_URL}/plane/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(plane),
    })

    // Invalidar caché de aviones
    Array.from(cache.keys())
      .filter((key) => key.startsWith("plane"))
      .forEach((key) => cache.delete(key))

    return await response.json()
  } catch (error) {
    console.error(`Error al actualizar avión con ID ${id}:`, error)
    throw error
  }
}

export async function deletePlane(id: number): Promise<void> {
  try {
    await fetchWithRetry(`${API_URL}/plane/${id}`, {
      method: "DELETE",
    })

    // Invalidar caché de aviones
    Array.from(cache.keys())
      .filter((key) => key.startsWith("plane"))
      .forEach((key) => cache.delete(key))
  } catch (error) {
    console.error(`Error al eliminar avión con ID ${id}:`, error)
    throw error
  }
}

// Funciones para Pilotos
export async function getPilots(page = 0, size = 10): Promise<Pilot[]> {
  try {
    const response = await fetchWithRetry(
      `${API_URL}/pilot/paged?page=${page}&size=${size}`,
      {
        method: "GET",
        ...API_CONFIG.FETCH_OPTIONS,
      }
    )
    const data = await response.json()
    // Si la respuesta tiene la propiedad 'content', retorna eso
    return data.content ?? data
  } catch (error) {
    console.error("Error al obtener pilotos:", error)
    throw error
  }
}

export async function getPilot(id: number): Promise<Pilot> {
  try {
    const cacheKey = `pilot-${id}`
    const now = Date.now()
    const cachedData = cache.get(cacheKey)

    if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data as Pilot
    }

    const response = await fetchWithRetry(`${API_URL}/pilot/${id}`, {
      method: "GET",
      ...API_CONFIG.FETCH_OPTIONS,
    })

    const data = await response.json()
    cache.set(cacheKey, { data, timestamp: now })

    return data
  } catch (error) {
    console.error(`Error al obtener piloto con ID ${id}:`, error)
    throw error
  }
}

export async function createPilot(pilot: Omit<Pilot, "id">): Promise<Pilot> {
  try {
    const response = await fetchWithRetry(`${API_URL}/pilot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pilot),
    })

    // Invalidar caché de pilotos
    Array.from(cache.keys())
      .filter((key) => key.startsWith("pilot"))
      .forEach((key) => cache.delete(key))

    return await response.json()
  } catch (error) {
    console.error("Error al crear piloto:", error)
    throw error
  }
}

export async function updatePilot(id: number, pilot: Omit<Pilot, "id">): Promise<Pilot> {
  try {
    const response = await fetchWithRetry(`${API_URL}/pilot/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pilot),
    })

    // Invalidar caché de pilotos
    Array.from(cache.keys())
      .filter((key) => key.startsWith("pilot"))
      .forEach((key) => cache.delete(key))

    return await response.json()
  } catch (error) {
    console.error(`Error al actualizar piloto con ID ${id}:`, error)
    throw error
  }
}

export async function deletePilot(id: number): Promise<void> {
  try {
    await fetchWithRetry(`${API_URL}/pilot/${id}`, {
      method: "DELETE",
    })

    // Invalidar caché de pilotos
    Array.from(cache.keys())
      .filter((key) => key.startsWith("pilot"))
      .forEach((key) => cache.delete(key))
  } catch (error) {
    console.error(`Error al eliminar piloto con ID ${id}:`, error)
    throw error
  }
}

export async function getFlights(page = 0, size = 10): Promise<Flight[]> {
  try {
    const response = await fetchWithRetry(
      `${API_URL}/flight/paged?page=${page}&size=${size}`,
      {
        method: "GET",
        ...API_CONFIG.FETCH_OPTIONS,
      }
    )
    const data = await response.json()
    // Si la respuesta tiene la propiedad 'content', retorna eso
    return data.content ?? data
  } catch (error) {
    console.error("Error al obtener vuelos:", error)
    throw error
  }
}

export async function getFlight(id: number): Promise<Flight> {
  try {
    const cacheKey = `flight-${id}`
    const now = Date.now()
    const cachedData = cache.get(cacheKey)

    if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data as Flight
    }

    const response = await fetchWithRetry(`${API_URL}/flight/${id}`, {
      method: "GET",
      ...API_CONFIG.FETCH_OPTIONS,
    })

    const data = await response.json()
    cache.set(cacheKey, { data, timestamp: now })

    return data
  } catch (error) {
    console.error(`Error al obtener vuelo con ID ${id}:`, error)
    throw error
  }
}

export async function createFlight(flight: FlightCreate): Promise<Flight> {
  try {
    const response = await fetchWithRetry(`${API_URL}/flight`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(flight),
    })

    // Invalidar caché de vuelos
    Array.from(cache.keys())
      .filter((key) => key.startsWith("flight"))
      .forEach((key) => cache.delete(key))

    return await response.json()
  } catch (error) {
    console.error("Error al crear vuelo:", error)
    throw error
  }
}

export async function updateFlight(id: number, flight: FlightCreate): Promise<Flight> {
  try {
    const response = await fetchWithRetry(`${API_URL}/flight/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(flight),
    })

    // Invalidar caché de vuelos
    Array.from(cache.keys())
      .filter((key) => key.startsWith("flight"))
      .forEach((key) => cache.delete(key))

    return await response.json()
  } catch (error) {
    console.error(`Error al actualizar vuelo con ID ${id}:`, error)
    throw error
  }
}

export async function deleteFlight(id: number): Promise<void> {
  try {
    await fetchWithRetry(`${API_URL}/flight/${id}`, {
      method: "DELETE",
    })

    // Invalidar caché de vuelos
    Array.from(cache.keys())
      .filter((key) => key.startsWith("flight"))
      .forEach((key) => cache.delete(key))
  } catch (error) {
    console.error(`Error al eliminar vuelo con ID ${id}:`, error)
    throw error
  }
}
