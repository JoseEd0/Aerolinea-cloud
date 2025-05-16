import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { Toaster } from "@/components/toaster"
import ConnectionStatus from "@/components/connection-status"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SkyWings - Gestión de Aerolínea",
  description: "Plataforma integrada para gestión de vuelos, pasajeros y servicios aeroportuarios",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <ConnectionStatus />
            <main className="flex-1">{children}</main>
            <footer className="bg-gray-100 dark:bg-gray-900 py-8 border-t border-gray-200 dark:border-gray-800">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="relative h-10 w-10 mr-2">
                        <img
                          src="/placeholder.svg?height=40&width=40"
                          alt="SkyWings Logo"
                          className="rounded-full object-cover h-10 w-10"
                        />
                      </div>
                      <h3 className="font-bold text-lg">SkyWings</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Plataforma integral de gestión para aerolíneas, optimizando operaciones y mejorando la experiencia
                      de pasajeros.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Módulos</h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="/vuelos" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                          Gestión de Vuelos
                        </a>
                      </li>
                      <li>
                        <a href="/pasajeros" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                          Gestión de Pasajeros
                        </a>
                      </li>
                      <li>
                        <a href="/equipajes" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                          Gestión de Equipajes
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Recursos</h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                          Documentación
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                          Soporte Técnico
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                  SkyWings - Gestión de Aerolínea © {new Date().getFullYear()}
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
