"use client"

import { useState, useEffect } from "react"
import { getCompras, type Compra } from "@/api/microservicio1"
import DataTable from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadCompras()
  }, [])

  const loadCompras = async () => {
    try {
      setLoading(true)
      const data = await getCompras()
      setCompras(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las compras. Intente nuevamente.",
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
      accessorKey: "id_historial" as keyof Compra,
    },
    {
      header: "Fecha",
      accessorKey: "fecha" as keyof Compra,
      cell: (compra: Compra) => formatDate(compra.fecha),
    },
    {
      header: "Asiento",
      accessorKey: "asiento" as keyof Compra,
    },
    {
      header: "ID Pasajero",
      accessorKey: "id_pasajero" as keyof Compra,
    },
    {
      header: "ID Vuelo",
      accessorKey: "id_vuelo" as keyof Compra,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Compras</h1>
        <Button onClick={() => router.push("/compras/nuevo")}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Compra
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compras</CardTitle>
          <CardDescription>Lista de todas las compras registradas en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Cargando compras...</p>
            </div>
          ) : (
            <DataTable
              data={compras}
              columns={columns}
              onAddNew={() => router.push("/compras/nuevo")}
              addNewLabel="Nueva Compra"
              searchPlaceholder="Buscar compras..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
