"use client"

import { useState, useEffect, useCallback } from "react"
import { getPasajeros, type Pasajero } from "@/api/microservicio1"
import DataTable from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Edit, Plus, Users, Mail, Phone, Calendar, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export default function PasajerosPage() {
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)
  const { toast } = useToast()
  const router = useRouter()

  const loadPasajeros = useCallback(
    async (page: number) => {
      try {
        setLoading(true)
        const data = await getPasajeros(page, itemsPerPage)
        setPasajeros(data)

        // En un caso real, la API debería devolver el total de páginas
        // Aquí asumimos un valor para la demostración
        setTotalPages(5)
      } catch (error) {
        console.error("Error al cargar pasajeros:", error)
        toast({
          title: "Error de conexión",
          description:
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los pasajeros. Verifique su conexión o si el servidor está disponible.",
          variant: "destructive",
          icon: <AlertCircle className="h-5 w-5" />,
        })
        // Establecer un array vacío para evitar errores en la interfaz
        setPasajeros([])
      } finally {
        setLoading(false)
      }
    },
    [toast, itemsPerPage],
  )

  useEffect(() => {
    loadPasajeros(currentPage)
  }, [currentPage, loadPasajeros])

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
      accessorKey: "id_pasajero" as keyof Pasajero,
      sortable: true,
    },
    {
      header: "Nombre",
      accessorKey: "nombre_completo" as keyof Pasajero,
      cell: (pasajero: Pasajero) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <span>{pasajero.nombre_completo}</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Género",
      accessorKey: "sexo" as keyof Pasajero,
      cell: (pasajero: Pasajero) => (
        <Badge
          variant="outline"
          className={
            pasajero.sexo?.toLowerCase() === "masculino" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"
          }
        >
          {pasajero.sexo}
        </Badge>
      ),
      sortable: true,
    },
    {
      header: "Fecha de Nacimiento",
      accessorKey: "fecha_nacimiento" as keyof Pasajero,
      cell: (pasajero: Pasajero) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {formatDate(pasajero.fecha_nacimiento)}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Email",
      accessorKey: "email" as keyof Pasajero,
      cell: (pasajero: Pasajero) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          {pasajero.email}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Teléfono",
      accessorKey: "telefono" as keyof Pasajero,
      cell: (pasajero: Pasajero) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          {pasajero.telefono}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Acciones",
      accessorKey: "actions" as keyof Pasajero,
      cell: (pasajero: Pasajero) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/pasajeros/editar/${pasajero.id_pasajero}`)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
      sortable: false,
    },
  ]

  // Imágenes de perfil para la vista de tarjetas
  const getProfileImage = (index: number) => {
    return `/placeholder.svg?height=100&width=100&text=Usuario${index + 1}`
  }

  return (
    <div>
      {/* Header con imagen de fondo */}
      <div className="relative h-64 mb-8">
        <Image
          src="/placeholder.svg?height=300&width=1200"
          alt="Pasajeros en aeropuerto"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestión de Pasajeros</h1>
            <p className="text-gray-200">Administre todos los pasajeros registrados en el sistema</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 space-y-8">
        <div className="flex justify-end">
          <Button
            onClick={() => router.push("/pasajeros/nuevo")}
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-white"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Pasajero
          </Button>
        </div>

        <Tabs defaultValue="tabla" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="tabla">Vista de Tabla</TabsTrigger>
            <TabsTrigger value="tarjetas">Vista de Tarjetas</TabsTrigger>
          </TabsList>
          <TabsContent value="tabla" className="mt-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Pasajeros</CardTitle>
                <CardDescription>Lista de todos los pasajeros registrados en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={pasajeros}
                  columns={columns}
                  onRowClick={(pasajero) => router.push(`/pasajeros/${pasajero.id_pasajero}`)}
                  onAddNew={() => router.push("/pasajeros/nuevo")}
                  addNewLabel="Nuevo Pasajero"
                  searchPlaceholder="Buscar pasajeros por nombre, email, teléfono..."
                  isLoading={loading}
                  serverSidePagination={true}
                  totalItems={50} // En un caso real, esto vendría de la API
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tarjetas" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="border-none shadow-md">
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : pasajeros.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium">No hay pasajeros registrados</h3>
                  <p className="text-muted-foreground mt-2 text-center max-w-md">
                    No se encontraron pasajeros en el sistema. Puede agregar un nuevo pasajero utilizando el botón
                    "Nuevo Pasajero".
                  </p>
                  <Button onClick={() => router.push("/pasajeros/nuevo")} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Pasajero
                  </Button>
                </div>
              ) : (
                pasajeros.map((pasajero, index) => (
                  <Card
                    key={pasajero.id_pasajero}
                    className="border-none shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                    onClick={() => router.push(`/pasajeros/${pasajero.id_pasajero}`)}
                  >
                    <div className="relative h-32 bg-gradient-to-r from-primary to-accent">
                      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center">
                        <div className="relative h-16 w-16 rounded-full border-4 border-white overflow-hidden mr-3">
                          <Image
                            src={getProfileImage(index) || "/placeholder.svg"}
                            alt={pasajero.nombre_completo}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{pasajero.nombre_completo}</h3>
                          <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                            {pasajero.sexo}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4 pt-10">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{pasajero.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{pasajero.telefono}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(pasajero.fecha_nacimiento)}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/pasajeros/editar/${pasajero.id_pasajero}`)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
