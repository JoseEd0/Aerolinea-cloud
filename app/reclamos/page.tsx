"use client"

import { useState, useEffect } from "react"
import { getClaims, deleteClaim, type Claim } from "@/api/microservicio3"
import DataTable from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Pagination from "@/components/pagination"

export default function ReclamosPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadClaims()
  }, [currentPage])

  const loadClaims = async () => {
    try {
      setLoading(true)
      const data = await getClaims(currentPage, itemsPerPage)
      setClaims(data)
      // Asumimos que hay 100 reclamos en total para la paginación
      // En un caso real, la API debería devolver el total
      setTotalPages(10)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los reclamos. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro que desea eliminar este reclamo?")) {
      try {
        await deleteClaim(id)
        toast({
          title: "Éxito",
          description: "Reclamo eliminado correctamente",
        })
        loadClaims()
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el reclamo. Intente nuevamente.",
          variant: "destructive",
        })
      }
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es })
    } catch (error) {
      return dateString
    }
  }

  const columns = [
    {
      header: "ID",
      accessorKey: "id" as keyof Claim,
    },
    {
      header: "ID Pasajero",
      accessorKey: "passenger_id" as keyof Claim,
    },
    {
      header: "Fecha de Reclamo",
      accessorKey: "claim_date" as keyof Claim,
      cell: (claim: Claim) => formatDate(claim.claim_date),
    },
    {
      header: "Plataforma",
      accessorKey: "claim_platform" as keyof Claim,
    },
    {
      header: "Motivo",
      accessorKey: "reason" as keyof Claim,
    },
    {
      header: "Acciones",
      accessorKey: "actions" as keyof Claim,
      cell: (claim: Claim) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/reclamos/editar/${claim.id}`)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(claim.id!)
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
        <h1 className="text-2xl font-bold">Gestión de Reclamos</h1>
        <Button onClick={() => router.push("/reclamos/nuevo")}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Reclamo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reclamos</CardTitle>
          <CardDescription>Lista de todos los reclamos registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Cargando reclamos...</p>
            </div>
          ) : (
            <>
              <DataTable
                data={claims}
                columns={columns}
                onRowClick={(claim) => router.push(`/reclamos/${claim.id}`)}
                onAddNew={() => router.push("/reclamos/nuevo")}
                addNewLabel="Nuevo Reclamo"
                searchPlaceholder="Buscar reclamos..."
              />
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
