import { apiGet, apiPost, apiDelete, apiPut, handleApiError } from "@/lib/api-utils"
import { API_BASE_URL } from "@/lib/api-config"

// Tipos
export interface Pasajero {
  id_pasajero?: number
  nombre_completo: string
  sexo: string
  fecha_nacimiento: string
  email: string
  telefono: string
}

export interface Membresia {
  id_membresia?: number
  tipo: string
  fecha_exploracion: string
  id_pasajero: number
}

export interface Compra {
  id_historial?: number
  fecha: string
  asiento: string
  id_pasajero: number
  id_vuelo: number
}

// URLs de API
const PASAJEROS_URL = `${API_BASE_URL}/pasajeros`
const MEMBRESIAS_URL = `${API_BASE_URL}/membresias`
const COMPRAS_URL = `${API_BASE_URL}/compras`

// Funciones para Pasajeros
export async function getPasajeros(page = 1, limit = 10): Promise<Pasajero[]> {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    }).toString()

    return await apiGet<Pasajero[]>(`${PASAJEROS_URL}?${queryParams}`)
  } catch (error) {
    const { message } = handleApiError(error)
    throw new Error(`Error al obtener pasajeros: ${message}`)
  }
}

export async function getPasajero(id: number): Promise<Pasajero> {
  try {
    return await apiGet<Pasajero>(`${PASAJEROS_URL}/${id}`)
  } catch (error) {
    const { message } = handleApiError(error)
    throw new Error(`Error al obtener pasajero: ${message}`)
  }
}

export async function createPasajero(pasajero: Omit<Pasajero, "id_pasajero">): Promise<Pasajero> {
  try {
    return await apiPost<Pasajero>(PASAJEROS_URL, pasajero)
  } catch (error) {
    const { message } = handleApiError(error)
    throw new Error(`Error al crear pasajero: ${message}`)
  }
}

export async function updatePasajero(id: number, pasajero: Partial<Pasajero>): Promise<Pasajero> {
  try {
    return await apiPut<Pasajero>(`${PASAJEROS_URL}/${id}`, pasajero)
  } catch (error) {
    const { message } = handleApiError(error)
    throw new Error(`Error al actualizar pasajero: ${message}`)
  }
}

export async function deletePasajero(id: number): Promise<void> {
  try {
    await apiDelete(`${PASAJEROS_URL}/${id}`)
  } catch (error) {
    const { message } = handleApiError(error)
    throw new Error(`Error al eliminar pasajero: ${message}`)
  }
}

// Funciones para Membresías
export async function getMembresias(page = 1, limit = 10): Promise<Membresia[]> {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    }).toString()

    return await apiGet<Membresia[]>(`${MEMBRESIAS_URL}?${queryParams}`)
  } catch (error) {
    const { message } = handleApiError(error)
    throw new Error(`Error al obtener membresías: ${message}`)
  }
}

export async function getMembresia(id: number): Promise<Membresia> {
  try {
    return await apiGet<Membresia>(`${MEMBRESIAS_URL}/${id}`)
  } catch (error) {
    const { message } = handleApiError(error)
    throw new Error(`Error al obtener membresía: ${message}`)
  }
}

export async function createMembresia(membresia: Omit<Membresia, "id_membresia">): Promise<Membresia> {
  try {
    return await apiPost<Membresia>(MEMBRESIAS_URL, membresia)
  } catch (error) {
    const { message } = handleApiError(error)
    throw new Error(`Error al crear membresía: ${message}`)
  }
}

export async function updateMembresia(id: number, membresia: Partial<Membresia>): Promise<Membresia> {
  try {
    return await apiPut<Membresia>(`${MEMBRESIAS_URL}/${id}`, membresia)
  } catch (error) {
    const { message } = handleApiError(error)
    throw new Error(`Error al actualizar membresía: ${message}`)
  }
}

export async function deleteMembresia(id: number): Promise<void> {
  try {
    await apiDelete(`${MEMBRESIAS_URL}/${id}`)
  } catch (error) {
    const { message } = handleApiError(error)
    throw new Error(`Error al eliminar membresía: ${message}`)
  }
}

// Funciones para Compras
export async function getCompras(page = 1, limit = 10): Promise<Compra[]> {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    }).toString()

    return await apiGet<Compra[]>(`${COMPRAS_URL}?${queryParams}`)
  } catch (error) {
    const { message } = handleApiError(error)
    throw new Error(`Error al obtener compras: ${message}`)
  }
}

export async function getCompra(id: number): Promise<Compra> {
  try {
    return await apiGet<Compra>(`${COMPRAS_URL}/${id}`)
  } catch (error) {
    const { message } = handleApiError(error)
    throw new Error(`Error al obtener compra: ${message}`)
  }
}

export async function createCompra(compra: Omit<Compra, "id_historial">): Promise<Compra> {
  try {
    return await apiPost<Compra>(COMPRAS_URL, compra)
  } catch (error) {
    const { message } = handleApiError(error)
    throw new Error(`Error al crear compra: ${message}`)
  }
}

export async function updateCompra(id: number, compra: Partial<Compra>): Promise<Compra> {
  try {
    return await apiPut<Compra>(`${COMPRAS_URL}/${id}`, compra)
  } catch (error) {
    const { message } = handleApiError(error)
    throw new Error(`Error al actualizar compra: ${message}`)
  }
}

export async function deleteCompra(id: number): Promise<void> {
  try {
    await apiDelete(`${COMPRAS_URL}/${id}`)
  } catch (error) {
    const { message } = handleApiError(error)
    throw new Error(`Error al eliminar compra: ${message}`)
  }
}
