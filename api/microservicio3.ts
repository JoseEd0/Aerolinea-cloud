import { API_CONFIG, fetchWithRetry } from "@/lib/api-config"

const API_URL = API_CONFIG.URLS.MICROSERVICIO3

// Tipos
export interface Equipment {
  id?: number
  passenger_id: number
  claim_date: string
  claim_platform: string
  reason: string
}

export interface Claim {
  id?: number
  passenger_id: number
  claim_date: string
  claim_platform: string
  reason: string
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

// Funciones para Equipajes
export async function getEquipments(page = 1, limit = 10): Promise<Equipment[]> {
  try {
    return await fetchWithCache<Equipment[]>(
      `${API_URL}/equipment/findAllEquipment`,
      {
        method: "GET",
        ...API_CONFIG.FETCH_OPTIONS,
      },
      "equipments",
      page,
      limit,
    )
  } catch (error) {
    console.error("Error detallado al obtener equipajes:", error)
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      throw new Error(
        "No se pudo conectar con el servidor. Verifique su conexión a internet o si el servidor está disponible.",
      )
    }
    throw error
  }
}

export async function getEquipment(id: number): Promise<Equipment> {
  try {
    const cacheKey = `equipment-${id}`
    const now = Date.now()
    const cachedData = cache.get(cacheKey)

    if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data as Equipment
    }

    const response = await fetchWithRetry(`${API_URL}/equipment/findOneEquipment?id=${id}`, {
      method: "GET",
      ...API_CONFIG.FETCH_OPTIONS,
    })

    const data = await response.json()
    cache.set(cacheKey, { data, timestamp: now })

    return data
  } catch (error) {
    console.error(`Error al obtener equipaje con ID ${id}:`, error)
    throw error
  }
}

export async function createEquipment(equipment: Equipment): Promise<Equipment> {
  try {
    const response = await fetchWithRetry(`${API_URL}/equipment/createEquipment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(equipment),
    })

    // Invalidar caché de equipajes
    Array.from(cache.keys())
      .filter((key) => key.startsWith("equipment"))
      .forEach((key) => cache.delete(key))

    return await response.json()
  } catch (error) {
    console.error("Error al crear equipaje:", error)
    throw error
  }
}

export async function updateEquipment(id: number, equipment: Equipment): Promise<Equipment> {
  try {
    const response = await fetchWithRetry(`${API_URL}/equipment/updateEquipment?id=${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(equipment),
    })

    // Invalidar caché de equipajes
    Array.from(cache.keys())
      .filter((key) => key.startsWith("equipment"))
      .forEach((key) => cache.delete(key))

    return await response.json()
  } catch (error) {
    console.error(`Error al actualizar equipaje con ID ${id}:`, error)
    throw error
  }
}

export async function deleteEquipment(id: number): Promise<void> {
  try {
    await fetchWithRetry(`${API_URL}/equipment/removeEquipment?id=${id}`, {
      method: "DELETE",
    })

    // Invalidar caché de equipajes
    Array.from(cache.keys())
      .filter((key) => key.startsWith("equipment"))
      .forEach((key) => cache.delete(key))
  } catch (error) {
    console.error(`Error al eliminar equipaje con ID ${id}:`, error)
    throw error
  }
}

// Funciones para Reclamos
export async function getClaims(page = 1, limit = 10): Promise<Claim[]> {
  try {
    return await fetchWithCache<Claim[]>(
      `${API_URL}/claim/findAllClaim`,
      {
        method: "GET",
        ...API_CONFIG.FETCH_OPTIONS,
      },
      "claims",
      page,
      limit,
    )
  } catch (error) {
    console.error("Error al obtener reclamos:", error)
    throw error
  }
}

export async function getClaim(id: number): Promise<Claim> {
  try {
    const cacheKey = `claim-${id}`
    const now = Date.now()
    const cachedData = cache.get(cacheKey)

    if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data as Claim
    }

    const response = await fetchWithRetry(`${API_URL}/claim/findOneClaim?id=${id}`, {
      method: "GET",
      ...API_CONFIG.FETCH_OPTIONS,
    })

    const data = await response.json()
    cache.set(cacheKey, { data, timestamp: now })

    return data
  } catch (error) {
    console.error(`Error al obtener reclamo con ID ${id}:`, error)
    throw error
  }
}

export async function createClaim(claim: Claim): Promise<Claim> {
  try {
    const response = await fetchWithRetry(`${API_URL}/claim/createClaim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(claim),
    })

    // Invalidar caché de reclamos
    Array.from(cache.keys())
      .filter((key) => key.startsWith("claim"))
      .forEach((key) => cache.delete(key))

    return await response.json()
  } catch (error) {
    console.error("Error al crear reclamo:", error)
    throw error
  }
}

export async function updateClaim(id: number, claim: Claim): Promise<Claim> {
  try {
    const response = await fetchWithRetry(`${API_URL}/claim/updateClaim?id=${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(claim),
    })

    // Invalidar caché de reclamos
    Array.from(cache.keys())
      .filter((key) => key.startsWith("claim"))
      .forEach((key) => cache.delete(key))

    return await response.json()
  } catch (error) {
    console.error(`Error al actualizar reclamo con ID ${id}:`, error)
    throw error
  }
}

export async function deleteClaim(id: number): Promise<void> {
  try {
    await fetchWithRetry(`${API_URL}/claim/removeClaim?id=${id}`, {
      method: "DELETE",
    })

    // Invalidar caché de reclamos
    Array.from(cache.keys())
      .filter((key) => key.startsWith("claim"))
      .forEach((key) => cache.delete(key))
  } catch (error) {
    console.error(`Error al eliminar reclamo con ID ${id}:`, error)
    throw error
  }
}
