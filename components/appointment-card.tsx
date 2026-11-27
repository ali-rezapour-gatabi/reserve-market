"use client"

import { useMemo, useState } from "react"
import {
  CalendarPlus,
  Check,
  Clock,
  Eye,
  Pencil,
  Phone,
  Search,
  Trash2,
  Undo2,
  UserRound,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { formatNumericDateTime, toFa, toFaDigits } from "@/lib/jalali"
import type { AppointmentRow } from "@/lib/repositories"

type StatusView = {
  label: string
  className: string
}

type AppointmentCardsProps = {
  rows: AppointmentRow[]
  emptyMessage: string
  pageSize?: number
  toolbar?: React.ReactNode
  weekdayName: (date: Date) => string
  getStatus: (row: AppointmentRow) => StatusView
  isInProgress: (row: AppointmentRow) => boolean
  onToggleDone: (row: AppointmentRow) => void
  onView: (row: AppointmentRow) => void
  onRepeat: (row: AppointmentRow) => void
  onEdit: (row: AppointmentRow) => void
  onDelete: (row: AppointmentRow) => void
}

/* ------------------------------------------------------------------ */
/*  Single card                                                        */
/* ------------------------------------------------------------------ */

function AppointmentCard({
  row,
  weekdayName,
  getStatus,
  isInProgress,
  onToggleDone,
  onView,
  onRepeat,
  onEdit,
  onDelete,
}: Omit<AppointmentCardsProps, "rows" | "emptyMessage" | "pageSize" | "toolbar"> & {
  row: AppointmentRow
}) {
  const start = new Date(row.start_at)
  const status = getStatus(row)
  const active = isInProgress(row)
  const done = row.status === "completed"
  const toggleable = row.status === "completed" || row.status === "scheduled"

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-sm",
        active ? "border-primary/40 ring-1 ring-primary/20" : "border-border/70"
      )}
    >
      {/* ───── Body ───── */}
      <div className="space-y-3 p-4">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-semibold tabular-nums">
              <Clock className="size-4 shrink-0 text-primary" />
              {formatNumericDateTime(start)}
            </div>
            <div className="mt-0.5 ps-5.5 text-xs text-muted-foreground">
              {weekdayName(start)}
            </div>
          </div>

          <span
            className={cn(
              "shrink-0 rounded-lg px-2.5 py-0.5 text-xs",
              active ? "bg-primary text-primary-foreground" : status.className
            )}
          >
            {active ? "در حال انجام" : status.label}
          </span>
        </header>

        <div className="border-t border-dashed pt-3">
          <h3 className="text-base font-bold leading-6">{row.full_name}</h3>

          {row.phone.length > 0 ? (
            <a
              href={`tel:${row.phone}`}
              className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums hover:text-foreground"
            >
              <Phone className="size-3.5" />
              {toFaDigits(row.phone)}
            </a>
          ) : (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="size-3.5" />
              بدون شماره
            </p>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <dt className="flex items-center gap-1 text-xs text-muted-foreground">
              <UserRound className="size-3.5" />
              متخصص
            </dt>
            <dd className="mt-0.5 truncate font-medium">
              {row.therapist_name ?? (
                <span className="font-normal text-muted-foreground">—</span>
              )}
            </dd>
          </div>

          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <dt className="flex items-center gap-1 text-xs text-muted-foreground">
              <Wallet className="size-3.5" />
              هزینه
            </dt>
            <dd className="mt-0.5 whitespace-nowrap font-medium tabular-nums">
              {toFa(row.price)} تومان
            </dd>
          </div>
        </dl>
      </div>

      {/* ───── Footer: all actions ───── */}
      <footer className="border-t bg-muted/30">
        {toggleable && (
          <div className="border-b p-2">
            <Button
              type="button"
              size="sm"
              variant={done ? "secondary" : "default"}
              className="h-10 w-full rounded-lg"
              onClick={() => onToggleDone(row)}
              aria-pressed={done}
              title={
                done
                  ? "بازگرداندن این نوبت به حالت زمان‌بندی‌شده"
                  : "علامت‌زدن این نوبت به‌عنوان انجام‌شده"
              }
            >
              {done ? <Undo2 className="size-4" /> : <Check className="size-4" />}
              {done ? "بازگشت به زمان‌بندی" : "انجام شد"}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-4 divide-x divide-x-reverse divide-border/70">
          <FooterAction
            icon={Eye}
            label="جزئیات"
            onClick={() => onView(row)}
            ariaLabel={`مشاهده جزئیات نوبت ${row.full_name}`}
          />
          <FooterAction
            icon={CalendarPlus}
            label="افزودن"
            onClick={() => onRepeat(row)}
            ariaLabel={`افزودن نوبت جدید برای ${row.full_name}`}
          />
          <FooterAction
            icon={Pencil}
            label="ویرایش"
            onClick={() => onEdit(row)}
            ariaLabel={`ویرایش نوبت ${row.full_name}`}
          />
          <FooterAction
            icon={Trash2}
            label="حذف"
            destructive
            onClick={() => onDelete(row)}
            ariaLabel={`حذف نوبت ${row.full_name}`}
          />
        </div>
      </footer>
    </article>
  )
}

function FooterAction({
  icon: Icon,
  label,
  onClick,
  ariaLabel,
  destructive,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  ariaLabel: string
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "flex h-14 flex-col items-center justify-center gap-1 text-xs outline-none transition-colors",
        "focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        destructive
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground/80 hover:bg-muted"
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  List with search + "show more"                                     */
/* ------------------------------------------------------------------ */

export function AppointmentCards({
  rows,
  emptyMessage,
  pageSize = 8,
  toolbar,
  ...handlers
}: AppointmentCardsProps) {
  const [query, setQuery] = useState("")
  const [visible, setVisible] = useState(pageSize)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const sorted = [...rows].sort(
      (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
    )
    if (!q) return sorted

    return sorted.filter((row) =>
      [row.full_name, row.phone, row.therapist_name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  }, [rows, query])

  const shown = filtered.slice(0, visible)
  const remaining = filtered.length - shown.length

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 right-3 my-auto size-4 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setVisible(pageSize)
            }}
            placeholder="جستجوی مشتری یا متخصص..."
            aria-label="جستجو در نوبت‌ها"
            className="h-11 rounded-xl bg-card pr-10"
          />
        </div>
      </div>

      {toolbar && <div className="[&>button]:w-full">{toolbar}</div>}

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          {query ? "نتیجه‌ای پیدا نشد." : emptyMessage}
        </p>
      ) : (
        <ul className="space-y-3">
          {shown.map((row) => (
            <li key={row.id}>
              <AppointmentCard row={row} {...handlers} />
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 && (
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-xl"
          onClick={() => setVisible((count) => count + pageSize)}
        >
          نمایش {toFa(Math.min(remaining, pageSize))} نوبت بیشتر
          <span className="text-xs text-muted-foreground">
            ({toFa(remaining)} باقی‌مانده)
          </span>
        </Button>
      )}
    </div>
  )
}
