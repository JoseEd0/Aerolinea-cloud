import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plane, Users, Package, Clock, MapPin, Shield, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export default function Home() {
  const modules = [
    {
      title: "Gestión de Vuelos",
      description: "Administra vuelos, aviones y pilotos de manera eficiente",
      icon: <Plane className="h-10 w-10 text-primary" />,
      links: [
        { href: "/vuelos", label: "Vuelos" },
        { href: "/aviones", label: "Aviones" },
        { href: "/pilotos", label: "Pilotos" },
      ],
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      title: "Gestión de Equipaje y Reclamos",
      description: "Administra equipajes y reclamos de pasajeros con facilidad",
      icon: <Package className="h-10 w-10 text-primary" />,
      links: [
        { href: "/equipajes", label: "Equipajes" },
        { href: "/reclamos", label: "Reclamos" },
      ],
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      title: "Gestión de Pasajeros",
      description: "Administra pasajeros, membresías y compras de manera integral",
      icon: <Users className="h-10 w-10 text-primary" />,
      links: [
        { href: "/pasajeros", label: "Pasajeros" },
        { href: "/membresias", label: "Membresías" },
        { href: "/compras", label: "Compras" },
      ],
      image: "/placeholder.svg?height=300&width=500",
    },
  ]

  const features = [
    {
      title: "Gestión Integral",
      description: "Administra todos los aspectos de la operación aérea desde una sola plataforma",
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Seguimiento en Tiempo Real",
      description: "Monitorea vuelos, equipajes y pasajeros en tiempo real con actualizaciones instantáneas",
      icon: <Clock className="h-8 w-8 text-primary" />,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Mapeo de Rutas",
      description: "Visualiza y optimiza rutas de vuelo para maximizar la eficiencia operativa",
      icon: <MapPin className="h-8 w-8 text-primary" />,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Seguridad Avanzada",
      description: "Protege los datos de pasajeros y operaciones con medidas de seguridad de nivel empresarial",
      icon: <Shield className="h-8 w-8 text-primary" />,
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/placeholder.svg?height=600&width=1200"
            alt="Avión en vuelo"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative h-full flex items-center">
          <div className="max-w-2xl space-y-6">
            <Badge className="bg-secondary text-white hover:bg-secondary/90 transition-colors">
              Gestión Aeronáutica
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
              Elevando la gestión aérea al siguiente nivel
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-lg">
              Plataforma integral para la gestión eficiente de vuelos, pasajeros y servicios aeroportuarios
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white" asChild>
                <Link href="/vuelos">Explorar Vuelos</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                <Link href="/pasajeros">Gestionar Pasajeros</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Módulos Principales</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nuestra plataforma ofrece módulos especializados para cada aspecto de la gestión aeronáutica
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {modules.map((module, index) => (
              <Card key={index} className="overflow-hidden card-hover-effect border-none shadow-lg">
                <div className="relative h-48">
                  <Image src={module.image || "/placeholder.svg"} alt={module.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <h3 className="text-xl font-bold text-white">{module.title}</h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-primary/10 p-3 rounded-full shrink-0">{module.icon}</div>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {module.links.map((link, linkIndex) => (
                      <Link href={link.href} key={linkIndex}>
                        <Button variant="outline" size="sm">
                          {link.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Características Principales</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubre las potentes funcionalidades que hacen de SkyWings la solución ideal para la gestión aeronáutica
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover-effect border-none shadow-md overflow-hidden">
                <div className="relative h-40">
                  <Image src={feature.image || "/placeholder.svg"} alt={feature.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <CardContent className="p-6 text-center">
                  <div className="bg-primary/10 p-4 rounded-full mx-auto w-fit mb-4 -mt-10 relative z-10 border-4 border-white dark:border-gray-900">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/placeholder.svg?height=400&width=1200" alt="Avión en pista" fill className="object-cover" />
          <div className="absolute inset-0 bg-primary/80"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4 text-white">¿Listo para optimizar tu gestión aeronáutica?</h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
            Comienza a utilizar nuestro sistema integral y lleva tu operación al siguiente nivel
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white" asChild>
              <Link href="/vuelos">Explorar Módulos</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
