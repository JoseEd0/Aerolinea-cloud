"use client"

import { useState, useEffect } from "react"
import { getEquipments, deleteEquipment, type Equipment } from "@/api/microservicio3"
import DataTable from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus, Package, Calendar, User, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"

export default function EquipajesPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadEquipments()
  }, [currentPage])

  const loadEquipments = async () => {
    try {
      setLoading(true)
      const data = await getEquipments(currentPage, itemsPerPage)
      setEquipments(data)
      // Asumimos que hay 100 equipajes en total para la paginación
      // En un caso real, la API debería devolver el total
      setTotalPages(10)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los equipajes. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro que desea eliminar este equipaje?")) {
      try {
        await deleteEquipment(id)
        toast({
          title: "Éxito",
          description: "Equipaje eliminado correctamente",
        })
        loadEquipments()
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el equipaje. Intente nuevamente.",
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

  const getReasonBadge = (reason: string) => {
    switch (reason.toLowerCase()) {
      case "lost":
        return <Badge variant="destructive">Perdido</Badge>
      case "damaged":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Dañado
          </Badge>
        )
      case "delayed":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Retrasado
          </Badge>
        )
      case "stolen":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Robado
          </Badge>
        )
      default:
        return <Badge variant="outline">{reason}</Badge>
    }
  }

  const columns = [
    {
      header: "ID",
      accessorKey: "id" as keyof Equipment,
      sortable: true,
    },
    {
      header: "ID Pasajero",
      accessorKey: "passenger_id" as keyof Equipment,
      cell: (equipment: Equipment) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          {equipment.passenger_id}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Fecha de Reclamo",
      accessorKey: "claim_date" as keyof Equipment,
      cell: (equipment: Equipment) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {formatDate(equipment.claim_date)}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Plataforma",
      accessorKey: "claim_platform" as keyof Equipment,
      cell: (equipment: Equipment) => (
        <Badge variant="outline" className="capitalize">
          {equipment.claim_platform}
        </Badge>
      ),
      sortable: true,
    },
    {
      header: "Motivo",
      accessorKey: "reason" as keyof Equipment,
      cell: (equipment: Equipment) => getReasonBadge(equipment.reason),
      sortable: true,
    },
    {
      header: "Estado",
      accessorKey: "status" as keyof Equipment,
      cell: (equipment: Equipment) => {
        // Simulamos un estado basado en la fecha de reclamo
        const claimDate = new Date(equipment.claim_date)
        const now = new Date()
        const daysDiff = Math.floor((now.getTime() - claimDate.getTime()) / (1000 * 60 * 60 * 24))

        let status = "En proceso"
        let progress = 50

        if (daysDiff > 7) {
          status = "Resuelto"
          progress = 100
        } else if (daysDiff > 3) {
          status = "En revisión"
          progress = 75
        } else if (daysDiff < 1) {
          status = "Registrado"
          progress = 25
        }

        return (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{status}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )
      },
      sortable: false,
    },
    {
      header: "Acciones",
      accessorKey: "actions" as keyof Equipment,
      cell: (equipment: Equipment) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/equipajes/editar/${equipment.id}`)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(equipment.id!)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      sortable: false,
    },
  ]

  return (
    <div>
      {/* Header con imagen de fondo */}
      <div className="relative h-64 mb-8">
        <Image
          src="https://images.unsplash.com/photo-1581553673739-c4906b5d0de8?q=80&w=2070&auto=format&fit=crop"
          alt="Equipajes en aeropuerto"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestión de Equipajes</h1>
            <p className="text-gray-200">Administre todos los equipajes y reclamos relacionados</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 space-y-8">
        <div className="flex justify-end">
          <Button
            onClick={() => router.push("/equipajes/nuevo")}
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-white"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Equipaje
          </Button>
        </div>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Equipajes</CardTitle>
            <CardDescription>Lista de todos los equipajes registrados en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={equipments}
              columns={columns}
              onRowClick={(equipment) => router.push(`/equipajes/${equipment.id}`)}
              onAddNew={() => router.push("/equipajes/nuevo")}
              addNewLabel="Nuevo Equipaje"
              searchPlaceholder="Buscar equipajes por ID, pasajero, motivo..."
              isLoading={loading}
            />
          </CardContent>
        </Card>

        {/* Sección de información de equipajes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="relative rounded-xl overflow-hidden h-64">
            <Image
              src="https://images.unsplash.com/photo-1596003906949-67221c37965c?q=80&w=2067&auto=format&fit=crop"
              alt="Seguridad de equipaje"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <h3 className="text-xl font-bold text-white mb-2">Seguridad de Equipaje</h3>
              <p className="text-gray-200 mb-4">
                Implementamos medidas de seguridad avanzadas para proteger el equipaje de nuestros pasajeros.
              </p>
              <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 w-fit">
                Ver Protocolos
              </Button>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden h-64">
            <Image
              src="https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?q=80&w=2070&auto=format&fit=crop"
              alt="Seguimiento en tiempo real"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <h3 className="text-xl font-bold text-white mb-2">Seguimiento en Tiempo Real</h3>
              <p className="text-gray-200 mb-4">
                Nuestro sistema permite rastrear el equipaje en tiempo real durante todo el viaje.
              </p>
              <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 w-fit">
                Activar Seguimiento
              </Button>
            </div>
          </div>
        </div>

        {/* Sección de tipos de reclamos */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Tipos de Reclamos</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                title: "Equipaje Perdido",
                description: "Gestione casos de equipaje extraviado durante el transporte",
                icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
                image: "https://images.unsplash.com/photo-1596003906949-67221c37965c?q=80&w=2067&auto=format&fit=crop",
              },
              {
                title: "Equipaje Dañado",
                description: "Procese reclamos por daños ocurridos durante el manejo",
                icon: <Package className="h-8 w-8 text-amber-500" />,
                image: "https://images.unsplash.com/photo-1596003906949-67221c37965c?q=80&w=2067&auto=format&fit=crop",
              },
              {
                title: "Equipaje Retrasado",
                description: "Gestione casos de equipaje que no llegó a tiempo",
                icon: <Clock className="h-8 w-8 text-blue-500" />,
                image: "https://images.unsplash.com/photo-1596003906949-67221c37965c?q=80&w=2067&auto=format&fit=crop",
              },
              {
                title: "Equipaje Recuperado",
                description: "Procese la devolución de equipaje encontrado",
                icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
                image: "https://images.unsplash.com/photo-1596003906949-67221c37965c?q=80&w=2067&auto=format&fit=crop",
              },
            ].map((type, index) => (
              <Card key={index} className="overflow-hidden border-none shadow-md">
                <div className="relative h-32">
                  <Image src={type.image || "/placeholder.svg"} alt={type.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">{type.icon}</div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{type.title}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
