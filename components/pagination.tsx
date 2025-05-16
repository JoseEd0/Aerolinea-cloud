"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export default function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  // No mostrar paginación si solo hay una página
  if (totalPages <= 1) return null

  // Función para generar el rango de páginas a mostrar
  const getPageRange = () => {
    const delta = 1 // Número de páginas a mostrar antes y después de la página actual
    const range = []
    const rangeWithDots = []

    // Siempre mostrar la primera página
    range.push(1)

    // Calcular el rango de páginas a mostrar
    if (totalPages > 1) {
      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i)
      }

      // Siempre mostrar la última página si hay más de una página
      if (totalPages > 1) {
        range.push(totalPages)
      }

      // Agregar puntos suspensivos donde sea necesario
      let l = range[0]
      for (const r of range) {
        if (r - l > 1) {
          rangeWithDots.push("dots" + l)
        }
        rangeWithDots.push(r)
        l = r
      }

      return rangeWithDots
    }

    return range
  }

  const pageRange = getPageRange()

  return (
    <div className={cn("flex items-center justify-center space-x-1", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        aria-label="Primera página"
        className="hidden sm:flex"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center space-x-1">
        {pageRange.map((page, index) => {
          if (typeof page === "string" && page.includes("dots")) {
            return (
              <span key={page} className="px-2 text-muted-foreground">
                ...
              </span>
            )
          }
          return (
            <Button
              key={index}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(page as number)}
              aria-label={`Página ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
              className={cn("h-8 w-8", currentPage === page ? "bg-primary text-primary-foreground" : "")}
            >
              {page}
            </Button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Página siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Última página"
        className="hidden sm:flex"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
