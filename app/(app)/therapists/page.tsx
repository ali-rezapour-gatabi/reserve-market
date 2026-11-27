"use client"

import { useCallback, useEffect, useState } from "react"
import { Pencil, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { TherapistDialog } from "@/components/therapist-dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import {
  createTherapist,
  deleteTherapist,
  listAllTherapists,
  setTherapistActive,
  updateTherapist,
} from "@/lib/repositories"
import type { Therapist, TherapistInput } from "@/lib/repositories"

export default function TherapistsPage() {
  const toast = useToast()
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Therapist | null>(null)

  const load = useCallback(() => {
    listAllTherapists()
      .then(setTherapists)
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

  const openEdit = (therapist: Therapist) => {
    setEditing(therapist)
    setDialogOpen(true)
  }

  const handleSubmit = async (input: TherapistInput) => {
    const rows = editing
      ? await updateTherapist(editing.id, input)
      : await createTherapist(input)

    setTherapists(rows)
    toast.success(editing ? "متخصص ویرایش شد." : "متخصص اضافه شد.")
    setEditing(null)
  }

  const handleToggle = async (therapist: Therapist) => {
    try {
      const rows = await setTherapistActive(
        therapist.id,
        therapist.is_active !== 1
      )
      setTherapists(rows)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تغییر وضعیت ناموفق بود"
      )
    }
  }

  const handleDelete = async (therapist: Therapist) => {
    try {
      const rows = await deleteTherapist(therapist.id)
      setTherapists(rows)
      toast.success("متخصص حذف شد.")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "حذف متخصص ناموفق بود"
      )
    }
  }

  const columns: DataTableColumn<Therapist>[] = [
    { key: "name", header: "نام", accessor: (row) => row.name },
    {
      key: "specialty",
      header: "تخصص",
      accessor: (row) => row.specialty ?? "",
      cell: (row) =>
        row.specialty ? (
          <span>{row.specialty}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "phone",
      header: "شماره تماس",
      accessor: (row) => row.phone ?? "",
      cell: (row) =>
        row.phone ? (
          <span dir="ltr">{row.phone}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
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
          <h1 className="text-lg font-bold sm:text-xl">متخصصان ماساژ</h1>
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            افزودن متخصص
          </Button>
        </section>

        <DataTable
          columns={columns}
          data={therapists}
          getRowId={(row) => row.id}
          initialSort={{ key: "name", dir: "asc" }}
          searchPlaceholder="جستجوی متخصص..."
          emptyMessage="هنوز متخصصی اضافه نکرده‌اید."
          pageSize={10}
        />
      </div>

      <TherapistDialog
        key={`${dialogOpen ? "open" : "closed"}-${editing?.id ?? "new"}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
      />
    </>
  )
}
