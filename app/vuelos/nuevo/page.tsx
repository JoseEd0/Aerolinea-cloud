"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createFlight, getPlanes, getPilots, type Plane, type Pilot, type FlightCreate } from "@/api/microservicio2"

export default function NuevoVueloPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [planes, setPlanes] = useState<Plane[]>([])
  const [pilots, setPilots] = useState<Pilot[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState<FlightCreate>({
    idPlane: 0,
    idPilot: 0,
    origin: "",
    destination: "",
    departure: "",
    arrival: "",
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [planesData, pilotsData] = await Promise.all([getPlanes(), getPilots()])
        setPlanes(planesData)
        setPilots(pilotsData)
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos necesarios. Intente nuevamente.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: Number(value) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.idPlane ||
      !formData.idPilot ||
      !formData.origin ||
      !formData.destination ||
      !formData.departure ||
      !formData.arrival
    ) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      await createFlight(formData)
      toast({
        title: "Éxito",
        description: "Vuelo creado correctamente",
      })
      router.push("/vuelos")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el vuelo. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Cargando datos...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo Vuelo</CardTitle>
          <CardDescription>Complete los datos para crear un nuevo vuelo</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Origen</Label>
                <Input
                  id="origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  placeholder="Ciudad de origen"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destino</Label>
                <Input
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Ciudad de destino"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departure">Fecha y Hora de Salida</Label>
                <Input
                  id="departure"
                  name="departure"
                  type="datetime-local"
                  value={formData.departure.split(".")[0]} // Eliminar milisegundos si existen
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrival">Fecha y Hora de Llegada</Label>
                <Input
                  id="arrival"
                  name="arrival"
                  type="datetime-local"
                  value={formData.arrival.split(".")[0]} // Eliminar milisegundos si existen
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idPlane">Avión</Label>
                <Select
                  onValueChange={(value) => handleSelectChange("idPlane", value)}
                  value={formData.idPlane.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un avión" />
                  </SelectTrigger>
                  <SelectContent>
                    {planes.map((plane) => (
                      <SelectItem key={plane.id} value={plane.id!.toString()}>
                        {plane.model} (Capacidad: {plane.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="idPilot">Piloto</Label>
                <Select
                  onValueChange={(value) => handleSelectChange("idPilot", value)}
                  value={formData.idPilot.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un piloto" />
                  </SelectTrigger>
                  <SelectContent>
                    {pilots.map((pilot) => (
                      <SelectItem key={pilot.id} value={pilot.id!.toString()}>
                        {pilot.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar Vuelo"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
