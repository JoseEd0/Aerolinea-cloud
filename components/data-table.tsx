"use client"

import React from "react"

import type { ReactNode } from "react"

import { useState, useEffect, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Filter, ArrowUpDown, Download, Loader2 } from "lucide-react"
import Pagination from "@/components/pagination"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useVirtualizer } from "@tanstack/react-virtual"
import { cn } from "@/lib/utils"

interface Column<T> {
  header: string
  accessorKey: keyof T
  cell?: (item: T) => ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void
  onAddNew?: () => void
  addNewLabel?: string
  searchPlaceholder?: string
  itemsPerPage?: number
  isLoading?: boolean
  serverSidePagination?: boolean
  totalItems?: number
  currentPage?: number
  onPageChange?: (page: number) => void
}

export default function DataTable<T>({
  data,
  columns,
  onRowClick,
  onAddNew,
  addNewLabel = "Agregar nuevo",
  searchPlaceholder = "Buscar...",
  itemsPerPage = 10,
  isLoading = false,
  serverSidePagination = false,
  totalItems = 0,
  currentPage: externalCurrentPage = 1,
  onPageChange: externalOnPageChange,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  // Referencia para virtualización
  const parentRef = React.useRef<HTMLDivElement>(null)

  // Debounce para la búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      if (!serverSidePagination) {
        setCurrentPage(1) // Resetear a la primera página al buscar
      }
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm, serverSidePagination])

  // Asegurarse de que data sea un array
  const safeData = Array.isArray(data) ? data : []

  // Filtrar datos según el término de búsqueda (solo para paginación del lado del cliente)
  const filteredData = !serverSidePagination
    ? safeData.filter((item) =>
        Object.values(item as Record<string, any>).some(
          (value) =>
            value !== null &&
            value !== undefined &&
            value.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
        ),
      )
    : safeData

  // Ordenar datos si es necesario (solo para paginación del lado del cliente)
  const sortedData =
    !serverSidePagination && sortColumn
      ? [...filteredData].sort((a, b) => {
          const aValue = a[sortColumn]
          const bValue = b[sortColumn]

          if (aValue === bValue) return 0

          // Manejar valores nulos o indefinidos
          if (aValue === null || aValue === undefined) return sortDirection === "asc" ? -1 : 1
          if (bValue === null || bValue === undefined) return sortDirection === "asc" ? 1 : -1

          // Comparar según el tipo
          if (typeof aValue === "string" && typeof bValue === "string") {
            return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
          }

          // Comparación numérica por defecto
          return sortDirection === "asc"
            ? (aValue as number) - (bValue as number)
            : (bValue as number) - (aValue as number)
        })
      : filteredData

  // Calcular paginación
  const totalPages = serverSidePagination
    ? Math.max(1, Math.ceil(totalItems / itemsPerPage))
    : Math.max(1, Math.ceil(sortedData.length / itemsPerPage))

  const startIndex = serverSidePagination ? 0 : (currentPage - 1) * itemsPerPage
  const paginatedData = serverSidePagination ? sortedData : sortedData.slice(startIndex, startIndex + itemsPerPage)

  // Virtualización para manejar grandes conjuntos de datos
  const rowVirtualizer = useVirtualizer({
    count: paginatedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // altura estimada de cada fila
    overscan: 5,
  })

  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Manejar cambio de página
  const handlePageChange = useCallback(
    (page: number) => {
      if (serverSidePagination && externalOnPageChange) {
        externalOnPageChange(page)
      } else {
        setCurrentPage(page)
      }
    },
    [serverSidePagination, externalOnPageChange],
  )

  // Usar página externa si se proporciona
  useEffect(() => {
    if (serverSidePagination && externalCurrentPage) {
      setCurrentPage(externalCurrentPage)
    }
  }, [serverSidePagination, externalCurrentPage])

  // Exportar a CSV
  const exportToCSV = () => {
    const headers = columns.map((col) => col.header).join(",")
    const rows = sortedData.map((item) =>
      columns
        .map((col) => {
          const value = item[col.accessorKey]
          if (value === null || value === undefined) return ""
          // Escapar comas y comillas
          return `"${String(value).replace(/"/g, '""')}"`
        })
        .join(","),
    )

    const csv = [headers, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "datos_exportados.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Skeleton className="h-10 w-full sm:w-64" />
          <Skeleton className="h-10 w-32" />
        </div>

        <Card className="border shadow-sm">
          <CardContent className="p-0">
            <div className="rounded-md border">
              <div className="p-4 flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Cargando datos...</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
            aria-label="Buscar"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSearchTerm("")}>Limpiar filtros</DropdownMenuItem>
              <DropdownMenuItem onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar a CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {onAddNew && (
            <Button onClick={onAddNew} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              {addNewLabel}
            </Button>
          )}
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="rounded-md border">
            <div
              ref={parentRef}
              style={{ height: `${Math.min(paginatedData.length * 56, 500)}px`, overflow: "auto" }}
              className="scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-primary/30 hover:scrollbar-thumb-primary/50"
            >
              <Table className="table-row-alternate table-row-hover">
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    {columns.map((column, index) => (
                      <TableHead key={index} className="font-semibold">
                        {column.sortable !== false ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 -ml-3 font-semibold"
                            onClick={() => handleSort(column.accessorKey)}
                          >
                            {column.header}
                            {sortColumn === column.accessorKey && (
                              <ArrowUpDown
                                className={cn(
                                  "ml-2 h-4 w-4 transition-transform",
                                  sortDirection === "asc" ? "transform rotate-180" : "",
                                )}
                              />
                            )}
                          </Button>
                        ) : (
                          column.header
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center py-6">
                          <Search className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-lg font-medium">No se encontraron resultados</p>
                          <p className="text-sm text-muted-foreground">
                            Intente con otros términos de búsqueda o limpie los filtros
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <div
                      style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: "100%",
                        position: "relative",
                      }}
                    >
                      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const item = paginatedData[virtualRow.index]
                        return (
                          <TableRow
                            key={virtualRow.index}
                            onClick={() => onRowClick && onRowClick(item)}
                            className={cn(onRowClick ? "cursor-pointer hover:bg-muted" : "", "transition-colors")}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: `${virtualRow.size}px`,
                              transform: `translateY(${virtualRow.start}px)`,
                            }}
                          >
                            {columns.map((column, colIndex) => (
                              <TableCell key={colIndex}>
                                {column.cell ? column.cell(item) : (item[column.accessorKey] as ReactNode)}
                              </TableCell>
                            ))}
                          </TableRow>
                        )
                      })}
                    </div>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, serverSidePagination ? totalItems : sortedData.length)} de{" "}
            {serverSidePagination ? totalItems : sortedData.length} resultados
          </p>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  )
}
