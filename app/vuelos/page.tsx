"use client"

import { useState, useEffect } from "react"
import { getFlights, deleteFlight, type Flight } from "@/api/microservicio2"
import DataTable from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus, Map, Calendar, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plane } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function VuelosPage() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadFlights()
  }, [currentPage])

  const loadFlights = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getFlights(currentPage, itemsPerPage)
      setFlights(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error al cargar vuelos:", error)
      setError("No se pudieron cargar los vuelos. Intente nuevamente.")
      toast({
        title: "Error",
        description: "No se pudieron cargar los vuelos. Intente nuevamente.",
        variant: "destructive",
      })
      setFlights([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!id) {
      toast({
        title: "Error",
        description: "ID de vuelo no válido",
        variant: "destructive",
      })
      return
    }

    if (window.confirm("¿Está seguro que desea eliminar este vuelo?")) {
      try {
        await deleteFlight(id)
        toast({
          title: "Éxito",
          description: "Vuelo eliminado correctamente",
          variant: "success",
        })
        loadFlights()
      } catch (error) {
        console.error("Error al eliminar vuelo:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el vuelo. Intente nuevamente.",
          variant: "destructive",
        })
      }
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"

    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es })
    } catch (error) {
      console.error("Error al formatear fecha:", error)
      return dateString
    }
  }

  const getFlightStatus = (flight: Flight) => {
    if (!flight.departure || !flight.arrival) {
      return { label: "Sin datos", color: "badge-gray" }
    }

    try {
      const now = new Date()
      const departure = new Date(flight.departure)
      const arrival = new Date(flight.arrival)

      if (now < departure) {
        return { label: "Programado", color: "badge-blue" }
      } else if (now >= departure && now <= arrival) {
        return { label: "En vuelo", color: "badge-green" }
      } else {
        return { label: "Completado", color: "badge-gray" }
      }
    } catch (error) {
      console.error("Error al determinar estado del vuelo:", error)
      return { label: "Error", color: "badge-red" }
    }
  }

  const columns = [
    {
      header: "ID",
      accessorKey: "id" as keyof Flight,
      sortable: true,
    },
    {
      header: "Origen",
      accessorKey: "origin" as keyof Flight,
      sortable: true,
      cell: (flight: Flight) => flight.origin || "N/A",
    },
    {
      header: "Destino",
      accessorKey: "destination" as keyof Flight,
      sortable: true,
      cell: (flight: Flight) => flight.destination || "N/A",
    },
    {
      header: "Salida",
      accessorKey: "departure" as keyof Flight,
      cell: (flight: Flight) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {formatDate(flight.departure)}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Llegada",
      accessorKey: "arrival" as keyof Flight,
      cell: (flight: Flight) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {formatDate(flight.arrival)}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Estado",
      accessorKey: "status" as keyof Flight,
      cell: (flight: Flight) => {
        const status = getFlightStatus(flight)
        return <span className={`badge ${status.color}`}>{status.label}</span>
      },
      sortable: false,
    },
    {
      header: "Avión",
      accessorKey: "planeDto" as keyof Flight,
      cell: (flight: Flight) => (
        <div className="flex items-center gap-2">
          <Plane className="h-4 w-4 text-muted-foreground" />
          {flight.planeDto?.model || "N/A"}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Piloto",
      accessorKey: "pilotDto" as keyof Flight,
      cell: (flight: Flight) => flight.pilotDto?.name || "N/A",
      sortable: true,
    },
    {
      header: "Acciones",
      accessorKey: "actions" as keyof Flight,
      cell: (flight: Flight) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              if (flight.id) {
                router.push(`/vuelos/editar/${flight.id}`)
              }
            }}
            disabled={!flight.id}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              if (flight.id) {
                handleDelete(flight.id)
              }
            }}
            disabled={!flight.id}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      sortable: false,
    },
  ]

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error al cargar los vuelos</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadFlights}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header con imagen de fondo */}
      <div className="relative h-64 mb-8">
        <Image
          src="/placeholder.svg?height=300&width=1200"
          alt="Aviones en aeropuerto"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestión de Vuelos</h1>
            <p className="text-gray-200">Administre todos los vuelos de la aerolínea</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 space-y-8">
        <div className="flex justify-end">
          <Button
            onClick={() => router.push("/vuelos/nuevo")}
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-white"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Vuelo
          </Button>
        </div>

        <Tabs defaultValue="tabla" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="tabla">Vista de Tabla</TabsTrigger>
            <TabsTrigger value="mapa">Vista de Mapa</TabsTrigger>
          </TabsList>
          <TabsContent value="tabla" className="mt-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Vuelos</CardTitle>
                <CardDescription>Lista de todos los vuelos registrados en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={flights}
                  columns={columns}
                  onRowClick={(flight) => flight.id && router.push(`/vuelos/${flight.id}`)}
                  onAddNew={() => router.push("/vuelos/nuevo")}
                  addNewLabel="Nuevo Vuelo"
                  searchPlaceholder="Buscar vuelos por origen, destino, piloto..."
                  isLoading={loading}
                  serverSidePagination={true}
                  totalItems={100} // En un caso real, esto vendría de la API
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="mapa" className="mt-6">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader>
                <CardTitle>Mapa de Vuelos</CardTitle>
                <CardDescription>Visualización geográfica de los vuelos activos</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative h-[600px]">
                  <Image
                    src="/placeholder.svg?height=600&width=1200"
                    alt="Mapa de vuelos"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 dark:bg-gray-900/90 p-6 rounded-lg max-w-md text-center backdrop-blur-sm">
                      <Map className="h-16 w-16 text-primary mx-auto mb-4" />
                      <h3 className="text-lg font-medium">Mapa interactivo de vuelos</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mt-2">
                        Visualice todos los vuelos activos en tiempo real. Haga clic en un vuelo para ver detalles
                        adicionales.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Próximos vuelos */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Próximos Vuelos</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden border-none shadow-md">
                  <div className="relative h-40 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </div>
                      </div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : flights.length === 0 ? (
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No hay vuelos programados</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                No se encontraron vuelos en el sistema. Puede agregar un nuevo vuelo utilizando el botón "Nuevo Vuelo".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {flights.slice(0, 3).map((flight, index) => (
                <Card
                  key={flight.id || index}
                  className={cn(
                    "overflow-hidden border-none shadow-md transition-all duration-300 hover:shadow-lg",
                    flight.id ? "cursor-pointer" : "",
                  )}
                  onClick={() => flight.id && router.push(`/vuelos/${flight.id}`)}
                >
                  <div className="relative h-40">
                    <Image
                      src={`/placeholder.svg?height=200&width=400&text=Vuelo${index + 1}`}
                      alt={`Vuelo ${flight.origin || ""} - ${flight.destination || ""}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <div>
                        <span className={`badge ${getFlightStatus(flight).color} mb-2`}>
                          {getFlightStatus(flight).label}
                        </span>
                        <h3 className="text-xl font-bold text-white">
                          {flight.origin || "N/A"} → {flight.destination || "N/A"}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Salida</p>
                        <p className="font-medium">{formatDate(flight.departure)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Llegada</p>
                        <p className="font-medium">{formatDate(flight.arrival)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avión</p>
                        <p className="font-medium">{flight.planeDto?.model || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Piloto</p>
                        <p className="font-medium">{flight.pilotDto?.name || "N/A"}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (flight.id) router.push(`/vuelos/${flight.id}`)
                      }}
                      disabled={!flight.id}
                    >
                      Ver detalles
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
