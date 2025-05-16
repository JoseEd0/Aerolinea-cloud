"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createPlane, type Plane } from "@/api/microservicio2"

export default function NuevoAvionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState<Omit<Plane, "id">>({
    model: "",
    capacity: 0,
    year_manufacture: {
      value: new Date().getFullYear(),
      leap: false,
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "capacity") {
      setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) || 0 }))
    } else if (name === "year_manufacture") {
      const year = Number.parseInt(value) || new Date().getFullYear()
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0

      setFormData((prev) => ({
        ...prev,
        year_manufacture: {
          value: year,
          leap: isLeapYear,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.model || formData.capacity <= 0) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos correctamente.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      await createPlane(formData)
      toast({
        title: "Éxito",
        description: "Avión creado correctamente",
      })
      router.push("/aviones")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el avión. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo Avión</CardTitle>
          <CardDescription>Complete los datos para crear un nuevo avión</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Modelo del avión"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidad</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Capacidad de pasajeros"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year_manufacture">Año de Fabricación</Label>
              <Input
                id="year_manufacture"
                name="year_manufacture"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.year_manufacture.value}
                onChange={handleChange}
                placeholder="Año de fabricación"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar Avión"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
