"use client"

import { useState, useEffect } from "react"
import { getMembresias, type Membresia } from "@/api/microservicio1"
import DataTable from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function MembresiasPage() {
  const [membresias, setMembresias] = useState<Membresia[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadMembresias()
  }, [])

  const loadMembresias = async () => {
    try {
      setLoading(true)
      const data = await getMembresias()
      setMembresias(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las membresías. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: es })
    } catch (error) {
      return dateString
    }
  }

  const columns = [
    {
      header: "ID",
      accessorKey: "id_membresia" as keyof Membresia,
    },
    {
      header: "Tipo",
      accessorKey: "tipo" as keyof Membresia,
      cell: (membresia: Membresia) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            membresia.tipo === "gold"
              ? "bg-yellow-100 text-yellow-800"
              : membresia.tipo === "silver"
                ? "bg-gray-100 text-gray-800"
                : "bg-amber-100 text-amber-800"
          }`}
        >
          {membresia.tipo.toUpperCase()}
        </span>
      ),
    },
    {
      header: "Fecha de Expiración",
      accessorKey: "fecha_exploracion" as keyof Membresia,
      cell: (membresia: Membresia) => formatDate(membresia.fecha_exploracion),
    },
    {
      header: "ID Pasajero",
      accessorKey: "id_pasajero" as keyof Membresia,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Membresías</h1>
        <Button onClick={() => router.push("/membresias/nuevo")}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Membresía
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membresías</CardTitle>
          <CardDescription>Lista de todas las membresías registradas en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Cargando membresías...</p>
            </div>
          ) : (
            <DataTable
              data={membresias}
              columns={columns}
              onAddNew={() => router.push("/membresias/nuevo")}
              addNewLabel="Nueva Membresía"
              searchPlaceholder="Buscar membresías..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
