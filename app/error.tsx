"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Registrar el error en la consola para depuración
    console.error("Error en la aplicación:", error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Ocurrió un error</CardTitle>
          </div>
          <CardDescription>Se produjo un error al cargar esta página o sus datos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-3 rounded-md text-sm">
            <p className="font-mono">{error.message || "Error desconocido"}</p>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Esto puede deberse a problemas de conexión con los servidores o a que los servicios no están disponibles en
            este momento.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Volver
          </Button>
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
