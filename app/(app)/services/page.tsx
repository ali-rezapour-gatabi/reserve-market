"use client"

import { useCallback, useEffect, useState } from "react"
import { Pencil, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { ServiceDialog } from "@/components/service-dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { toFa } from "@/lib/jalali"
import {
  createService,
  deleteService,
  listAllServices,
  setServiceActive,
  updateService,
} from "@/lib/repositories"
import type { Service, ServiceInput } from "@/lib/repositories"

export default function ServicesPage() {
  const toast = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)

  const load = useCallback(() => {
    listAllServices()
      .then(setServices)
      .catch((error) =>
        toast.error(
          error instanceof Error ? error.message : "خطای ناشناخته"
        )
      )
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (service: Service) => {
    setEditing(service)
    setDialogOpen(true)
  }

  const handleSubmit = async (input: ServiceInput) => {
    const rows = editing
      ? await updateService(editing.id, input)
      : await createService(input)

    setServices(rows)
    toast.success(editing ? "خدمت ویرایش شد." : "خدمت اضافه شد.")
    setEditing(null)
  }

  const handleToggle = async (service: Service) => {
    try {
      const rows = await setServiceActive(service.id, service.is_active !== 1)
      setServices(rows)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تغییر وضعیت ناموفق بود"
      )
    }
  }

  const handleDelete = async (service: Service) => {
    try {
      const rows = await deleteService(service.id)
      setServices(rows)
      toast.success("خدمت حذف شد.")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "حذف خدمت ناموفق بود"
      )
    }
  }

  const columns: DataTableColumn<Service>[] = [
    { key: "name", header: "نام خدمت", accessor: (row) => row.name },
    {
      key: "description",
      header: "توضیحات",
      accessor: (row) => row.description ?? "",
      cell: (row) =>
        row.description ? (
          <span className="text-muted-foreground">{row.description}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "duration",
      header: "مدت",
      accessor: (row) => row.duration_minutes,
      cell: (row) => <span>{toFa(row.duration_minutes)} دقیقه</span>,
    },
    {
      key: "price",
      header: "قیمت",
      accessor: (row) => row.price,
      cell: (row) => <span>{toFa(row.price)} تومان</span>,
    },
    {
      key: "status",
      header: "وضعیت",
      accessor: (row) => (row.is_active === 1 ? "فعال" : "غیرفعال"),
      cell: (row) => (
        <span
          className={
            row.is_active === 1
              ? "rounded-lg bg-primary/10 px-2.5 py-0.5 text-xs text-primary"
              : "rounded-lg bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
          }
        >
          {row.is_active === 1 ? "فعال" : "غیرفعال"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "عملیات",
      sortable: false,
      align: "start",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => openEdit(row)}
          >
            <Pencil className="size-3.5" />
            ویرایش
          </Button>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => void handleToggle(row)}
          >
            {row.is_active === 1 ? (
              <ToggleRight className="size-3.5" />
            ) : (
              <ToggleLeft className="size-3.5" />
            )}
            {row.is_active === 1 ? "غیرفعال" : "فعال"}
          </Button>
          <Button
            type="button"
            size="xs"
            variant="destructive"
            onClick={() => void handleDelete(row)}
          >
            <Trash2 className="size-3.5" />
            حذف
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="space-y-5">
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 text-card-foreground shadow-sm shadow-foreground/[0.02] sm:p-5">
          <h1 className="text-lg font-bold sm:text-xl">خدمات</h1>
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            افزودن خدمت
          </Button>
        </section>

        <DataTable
          columns={columns}
          data={services}
          getRowId={(row) => row.id}
          initialSort={{ key: "name", dir: "asc" }}
          searchPlaceholder="جستجوی خدمت..."
          emptyMessage="هنوز خدمتی اضافه نکرده‌اید."
          pageSize={10}
        />
      </div>

      <ServiceDialog
        key={`${dialogOpen ? "open" : "closed"}-${editing?.id ?? "new"}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
      />
    </>
  )
}
