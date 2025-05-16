"use client"

import { useState, useEffect } from "react"
import { getPlanes, deletePlane, type Plane } from "@/api/microservicio2"
import DataTable from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AvionesPage() {
  const [planes, setPlanes] = useState<Plane[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadPlanes()
  }, [])

  const loadPlanes = async () => {
    try {
      setLoading(true)
      const data = await getPlanes()
      setPlanes(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los aviones. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro que desea eliminar este avión?")) {
      try {
        await deletePlane(id)
        toast({
          title: "Éxito",
          description: "Avión eliminado correctamente",
        })
        loadPlanes()
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el avión. Intente nuevamente.",
          variant: "destructive",
        })
      }
    }
  }

  const columns = [
    {
      header: "ID",
      accessorKey: "id" as keyof Plane,
    },
    {
      header: "Modelo",
      accessorKey: "model" as keyof Plane,
    },
    {
      header: "Capacidad",
      accessorKey: "capacity" as keyof Plane,
    },
    {
      header: "Año de Fabricación",
      accessorKey: "year_manufacture" as keyof Plane,
      cell: (plane: Plane) => plane.year_manufacture?.value || "N/A",
    },
    {
      header: "Acciones",
      accessorKey: "actions" as keyof Plane,
      cell: (plane: Plane) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/aviones/editar/${plane.id}`)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(plane.id!)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Aviones</h1>
        <Button onClick={() => router.push("/aviones/nuevo")}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Avión
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aviones</CardTitle>
          <CardDescription>Lista de todos los aviones registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Cargando aviones...</p>
            </div>
          ) : (
            <DataTable
              data={planes}
              columns={columns}
              onRowClick={(plane) => router.push(`/aviones/${plane.id}`)}
              onAddNew={() => router.push("/aviones/nuevo")}
              addNewLabel="Nuevo Avión"
              searchPlaceholder="Buscar aviones..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
