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
import { createMembresia, type Membresia, getPasajeros, type Pasajero } from "@/api/microservicio1"

export default function NuevaMembresiaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<Omit<Membresia, "id_membresia">>({
    tipo: "",
    fecha_exploracion: "",
    id_pasajero: 0,
  })

  useEffect(() => {
    const loadPasajeros = async () => {
      try {
        setLoading(true)
        const data = await getPasajeros()
        setPasajeros(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los pasajeros. Intente nuevamente.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadPasajeros()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "id_pasajero") {
      setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.tipo || !formData.fecha_exploracion || !formData.id_pasajero) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      await createMembresia(formData)
      toast({
        title: "Éxito",
        description: "Membresía creada correctamente",
      })
      router.push("/membresias")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la membresía. Intente nuevamente.",
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
          <CardTitle>Nueva Membresía</CardTitle>
          <CardDescription>Complete los datos para crear una nueva membresía</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Membresía</Label>
              <Select onValueChange={(value) => handleSelectChange("tipo", value)} value={formData.tipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_exploracion">Fecha de Expiración</Label>
              <Input
                id="fecha_exploracion"
                name="fecha_exploracion"
                type="date"
                value={formData.fecha_exploracion}
                onChange={handleChange}
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar Membresía"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
