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
import { createClaim, type Claim } from "@/api/microservicio3"
import { getPasajeros, type Pasajero } from "@/api/microservicio1"

export default function NuevoReclamoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<Omit<Claim, "id">>({
    passenger_id: 0,
    claim_date: new Date().toISOString(),
    claim_platform: "web",
    reason: "lost",
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
    if (name === "passenger_id") {
      setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.passenger_id || !formData.claim_date || !formData.claim_platform || !formData.reason) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      await createClaim(formData)
      toast({
        title: "Éxito",
        description: "Reclamo registrado correctamente",
      })
      router.push("/reclamos")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el reclamo. Intente nuevamente.",
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
          <CardTitle>Nuevo Reclamo</CardTitle>
          <CardDescription>Complete los datos para registrar un nuevo reclamo</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passenger_id">Pasajero</Label>
              <Select
                onValueChange={(value) => handleSelectChange("passenger_id", value)}
                value={formData.passenger_id.toString()}
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
              <Label htmlFor="claim_date">Fecha de Reclamo</Label>
              <Input
                id="claim_date"
                name="claim_date"
                type="datetime-local"
                value={formData.claim_date.split(".")[0]} // Eliminar milisegundos si existen
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="claim_platform">Plataforma</Label>
              <Select
                onValueChange={(value) => handleSelectChange("claim_platform", value)}
                value={formData.claim_platform}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="mobile">Móvil</SelectItem>
                  <SelectItem value="kiosk">Kiosko</SelectItem>
                  <SelectItem value="counter">Mostrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo</Label>
              <Select onValueChange={(value) => handleSelectChange("reason", value)} value={formData.reason}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lost">Perdido</SelectItem>
                  <SelectItem value="damaged">Dañado</SelectItem>
                  <SelectItem value="delayed">Retrasado</SelectItem>
                  <SelectItem value="stolen">Robado</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : "Registrar Reclamo"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
