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
import { createCompra, type Compra, getPasajeros, type Pasajero } from "@/api/microservicio1"
import { getFlights, type Flight } from "@/api/microservicio2"

export default function NuevaCompraPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([])
  const [vuelos, setVuelos] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<Omit<Compra, "id_historial">>({
    fecha: new Date().toISOString().split("T")[0],
    asiento: "",
    id_pasajero: 0,
    id_vuelo: 0,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [pasajerosData, vuelosData] = await Promise.all([getPasajeros(), getFlights()])
        setPasajeros(pasajerosData)
        setVuelos(vuelosData)
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
    setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.fecha || !formData.asiento || !formData.id_pasajero || !formData.id_vuelo) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      await createCompra(formData)
      toast({
        title: "Éxito",
        description: "Compra creada correctamente",
      })
      router.push("/compras")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la compra. Intente nuevamente.",
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
          <CardTitle>Nueva Compra</CardTitle>
          <CardDescription>Complete los datos para registrar una nueva compra</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asiento">Asiento</Label>
              <Input
                id="asiento"
                name="asiento"
                value={formData.asiento}
                onChange={handleChange}
                placeholder="Ej: A1, B2, C3"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_pasajero">Pasajero</Label>
              <Select
                onValueChange={(value) => handleSelectChange("id_pasajero", value)}
                value={formData.id_pasajero.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un pasajero" />
                </SelectTrigger>
                <SelectContent>
                  {pasajeros.map((pasajero) => (
                    <SelectItem key={pasajero.id_pasajero} value={pasajero.id_pasajero!.toString()}>
                      {pasajero.nombre_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_vuelo">Vuelo</Label>
              <Select
                onValueChange={(value) => handleSelectChange("id_vuelo", value)}
                value={formData.id_vuelo.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un vuelo" />
                </SelectTrigger>
                <SelectContent>
                  {vuelos.map((vuelo) => (
                    <SelectItem key={vuelo.id} value={vuelo.id!.toString()}>
                      {vuelo.origin} → {vuelo.destination} ({new Date(vuelo.departure).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : "Registrar Compra"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
