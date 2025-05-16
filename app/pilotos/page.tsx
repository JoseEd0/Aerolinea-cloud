"use client"

import { useState, useEffect } from "react"
import { getPilots, deletePilot, type Pilot } from "@/api/microservicio2"
import DataTable from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PilotosPage() {
  const [pilots, setPilots] = useState<Pilot[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadPilots()
  }, [])

  const loadPilots = async () => {
    try {
      setLoading(true)
      const data = await getPilots()
      setPilots(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los pilotos. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro que desea eliminar este piloto?")) {
      try {
        await deletePilot(id)
        toast({
          title: "Éxito",
          description: "Piloto eliminado correctamente",
        })
        loadPilots()
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el piloto. Intente nuevamente.",
          variant: "destructive",
        })
      }
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
      accessorKey: "id" as keyof Pilot,
    },
    {
      header: "Nombre",
      accessorKey: "name" as keyof Pilot,
    },
    {
      header: "Género",
      accessorKey: "gender" as keyof Pilot,
    },
    {
      header: "Fecha de Nacimiento",
      accessorKey: "birthDate" as keyof Pilot,
      cell: (pilot: Pilot) => formatDate(pilot.birthDate),
    },
    {
      header: "Acciones",
      accessorKey: "actions" as keyof Pilot,
      cell: (pilot: Pilot) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/pilotos/editar/${pilot.id}`)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(pilot.id!)
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
        <h1 className="text-2xl font-bold">Gestión de Pilotos</h1>
        <Button onClick={() => router.push("/pilotos/nuevo")}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Piloto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pilotos</CardTitle>
          <CardDescription>Lista de todos los pilotos registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Cargando pilotos...</p>
            </div>
          ) : (
            <DataTable
              data={pilots}
              columns={columns}
              onRowClick={(pilot) => router.push(`/pilotos/${pilot.id}`)}
              onAddNew={() => router.push("/pilotos/nuevo")}
              addNewLabel="Nuevo Piloto"
              searchPlaceholder="Buscar pilotos..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
