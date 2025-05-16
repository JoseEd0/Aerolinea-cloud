"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Wifi, WifiOff, X, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { API_CONFIG } from "@/lib/api-config"

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [apiStatus, setApiStatus] = useState<{
    ms1: boolean
    ms2: boolean
    ms3: boolean
  }>({
    ms1: true,
    ms2: true,
    ms3: true,
  })
  const [showAlert, setShowAlert] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [alertType, setAlertType] = useState<"error" | "success" | "checking">("checking")
  const [lastSuccessfulCheck, setLastSuccessfulCheck] = useState(Date.now())

  // Verificar la conexión a internet
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      checkApiStatus() // Verificar APIs cuando vuelve la conexión
    }
    const handleOffline = () => {
      setIsOnline(false)
      setShowAlert(true)
      setDismissed(false)
      setAlertType("error")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Verificar la conexión a las APIs
  const checkApiStatus = async () => {
    if (isChecking) return

    try {
      setIsChecking(true)
      setProgress(0)

      // Solo mostrar alerta de verificación si han pasado más de 2 horas desde la última verificación exitosa
      const twoHoursInMs = 2 * 60 * 60 * 1000
      const shouldShowCheckingAlert = Date.now() - lastSuccessfulCheck > twoHoursInMs

      if (shouldShowCheckingAlert) {
        setAlertType("checking")
        setShowAlert(true)
      }

      // Incrementar progreso gradualmente
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Verificar microservicio 1
      const ms1Status = await fetch(`${API_CONFIG.URLS.MICROSERVICIO1}/pasajeros/`, {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-cache",
        signal: AbortSignal.timeout(5000),
      })
        .then(() => true)
        .catch(() => false)

      setProgress(30)

      // Verificar microservicio 2
      const ms2Status = await fetch(`${API_CONFIG.URLS.MICROSERVICIO2}/plane/all`, {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-cache",
        signal: AbortSignal.timeout(5000),
      })
        .then(() => true)
        .catch(() => false)

      setProgress(60)

      // Verificar microservicio 3
      const ms3Status = await fetch(`${API_CONFIG.URLS.MICROSERVICIO3}/equipment/findAllEquipment`, {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-cache",
        signal: AbortSignal.timeout(5000),
      })
        .then(() => true)
        .catch(() => false)

      clearInterval(progressInterval)
      setProgress(100)

      const newStatus = {
        ms1: ms1Status,
        ms2: ms2Status,
        ms3: ms3Status,
      }

      setApiStatus(newStatus)

      // Mostrar alerta si alguna API está caída y no ha sido descartada
      const hasIssue = !ms1Status || !ms2Status || !ms3Status

      if (hasIssue && !dismissed && shouldShowCheckingAlert) {
        setAlertType("error")
        setShowAlert(true)
      } else if (!hasIssue) {
        // Actualizar timestamp de última verificación exitosa
        setLastSuccessfulCheck(Date.now())

        // Solo mostrar alerta de éxito si estábamos mostrando una alerta de verificación
        if (shouldShowCheckingAlert) {
          setAlertType("success")
          setShowAlert(true)
          // Ocultar la alerta de éxito después de 3 segundos
          setTimeout(() => {
            setShowAlert(false)
          }, 3000)
        } else {
          setShowAlert(false)
        }
      }
    } catch (error) {
      console.error("Error al verificar estado de APIs:", error)
      // Solo mostrar error si han pasado más de 2 horas
      const twoHoursInMs = 2 * 60 * 60 * 1000
      if (!dismissed && Date.now() - lastSuccessfulCheck > twoHoursInMs) {
        setAlertType("error")
        setShowAlert(true)
      }
    } finally {
      setIsChecking(false)
      setProgress(100)
    }
  }

  useEffect(() => {
    // Verificar al cargar y cada 30 minutos
    checkApiStatus()
    const interval = setInterval(checkApiStatus, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [dismissed])

  const handleDismiss = () => {
    setDismissed(true)
    setShowAlert(false)
  }

  if (!showAlert) return null

  return (
    <Alert
      variant={alertType === "error" ? "destructive" : alertType === "success" ? "success" : "default"}
      className="m-4 relative shadow-lg border-l-4 border-l-primary"
    >
      {alertType === "error" && (
        <>
          {!isOnline ? <WifiOff className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <AlertTitle className="flex items-center gap-2">
            {!isOnline ? "Sin conexión a Internet" : "Problemas de conexión con los servidores"}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {!isOnline ? (
              "No hay conexión a Internet. Por favor, verifique su conexión."
            ) : (
              <div className="space-y-2">
                <p>Se detectaron problemas de conexión con los siguientes servicios:</p>
                <ul className="list-disc pl-5">
                  {!apiStatus.ms1 && <li>Servicio de Pasajeros</li>}
                  {!apiStatus.ms2 && <li>Servicio de Vuelos</li>}
                  {!apiStatus.ms3 && <li>Servicio de Equipajes y Reclamos</li>}
                </ul>
                <Button size="sm" onClick={() => checkApiStatus()} className="mt-2">
                  <Wifi className="h-4 w-4 mr-2" /> Reintentar conexión
                </Button>
              </div>
            )}
          </AlertDescription>
        </>
      )}

      {alertType === "checking" && (
        <>
          <Wifi className="h-5 w-5 animate-pulse" />
          <AlertTitle>Verificando conexión</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="space-y-1">
              <p>Comprobando la conexión con los servicios...</p>
              <Progress value={progress} className="h-1" />
            </div>
          </AlertDescription>
        </>
      )}

      {alertType === "success" && (
        <>
          <CheckCircle className="h-5 w-5" />
          <AlertTitle>Conexión establecida</AlertTitle>
          <AlertDescription className="mt-2">Todos los servicios están funcionando correctamente.</AlertDescription>
        </>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 text-foreground/80 hover:text-foreground"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Cerrar</span>
      </Button>
    </Alert>
  )
}
