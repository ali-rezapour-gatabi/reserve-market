"use client"

import { useEffect, useMemo, useState } from "react"
import { addDays, startOfDay } from "date-fns"
import {
  AlertCircle,
  CalendarCheck2,
  CalendarDays,
  Clock,
  ListChecks,
  Loader2,
  Phone,
  Repeat,
  Sparkles,
  StickyNote,
  User,
  UserRound,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { CustomerSearch } from "@/components/customer-search"
import { DatePicker } from "@/components/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PersianNumberInput } from "@/components/persian-number-input"
import {
  DEFAULT_SESSION_MINUTES,
  ServicePicker,
  summarizeServices,
} from "@/components/service-picker"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { WeekdaysPicker } from "@/components/weekdays-picker"
import { cn } from "@/lib/utils"

import { formatNumericDateTime, toFa, toFaDigits } from "@/lib/jalali"
import {
  WEEKDAY_NAMES,
  addMinutes,
  combineDateAndTime,
  formatSession,
  generateWeeklySessions,
  sortWeekdays,
  startOfToday,
  uniqueDates,
  hasTimeConflict,
  MAX_SESSIONS,
} from "@/lib/schedule"
import type {
  AppointmentRow,
  AppointmentStatus,
  NewBooking,
  Service,
  SessionRange,
  Therapist,
} from "@/lib/repositories"
import { listForRange } from "@/lib/repositories"

type ScheduleMode = "dates" | "weekly"

export type CreateBookPrefill = {
  fullName: string
  phone: string
  serviceIds: number[]
  therapistId: string
  notes?: string
  time?: string
}

type CreateBookProps = {
  services: Service[]
  therapists: Therapist[]
  onCreate: (booking: NewBooking) => Promise<void>
  prefill?: CreateBookPrefill
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  trigger?: React.ReactNode
  triggerClassName?: string
}

const QUICK_TIMES = [
  "09:00",
  "10:30",
  "12:00",
  "13:30",
  "15:00",
  "16:30",
  "18:00",
  "19:30",
  "21:00",
  "22:30",
]

const formatClock = (date: Date) =>
  toFaDigits(
    `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`
  )

const emptyForm = {
  fullName: "",
  phone: "",
  serviceIds: [] as number[],
  price: "",
  therapistId: "",
  time: "",
  status: "scheduled" as AppointmentStatus,
  notes: "",
  mode: "dates" as ScheduleMode,
  dates: [] as Date[],
  startDate: [] as Date[],
  weekdays: [] as number[],
  totalSessions: "4",
  referral: "",
}

function createEmptyForm(today: Date, prefill?: CreateBookPrefill) {
  return {
    ...emptyForm,
    fullName: prefill?.fullName ?? "",
    phone: prefill?.phone ?? "",
    serviceIds: prefill?.serviceIds ?? [],
    therapistId: prefill?.therapistId ?? "",
    notes: prefill?.notes ?? "",
    time: prefill?.time ?? "",
    dates: [today],
    startDate: [today],
    referral: "",
  }
}

/* ------------------------------------------------------------------ */
/*  Layout primitives                                                  */
/* ------------------------------------------------------------------ */

function Step({
  index,
  icon: Icon,
  title,
  hint,
  children,
}: {
  index: number
  icon: React.ComponentType<{ className?: string }>
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="grid gap-4 py-6 first:pt-0 last:pb-0 md:grid-cols-[11rem_1fr] md:gap-8">
      <header className="flex items-start gap-3 md:flex-col md:gap-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground tabular-nums">
          {toFa(index)}
        </span>
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 text-sm font-bold leading-6">
            <Icon className="size-4 text-primary md:hidden" />
            {title}
          </h3>
          {hint && (
            <p className="text-xs leading-5 text-muted-foreground">{hint}</p>
          )}
        </div>
      </header>
      <div className="min-w-0 space-y-4">{children}</div>
    </section>
  )
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  required?: boolean
  hint?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function IconInputWrap({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute inset-y-0 right-3 z-10 my-auto size-4 text-muted-foreground" />
      {children}
    </div>
  )
}

function SummaryRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-sm font-medium leading-6 text-foreground">
          {children ?? <span className="font-normal text-muted-foreground/70">—</span>}
        </div>
      </div>
    </div>
  )
}

const inputClass = "h-11 rounded-lg bg-background"


export function CreateBook({
  services,
  therapists,
  onCreate,
  prefill,
  open: openProp,
  onOpenChange,
  title = "ثبت نوبت جدید",
  trigger,
  triggerClassName,
}: CreateBookProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolledOpen
  const today = useMemo(() => startOfToday(), [])
  const [form, setForm] = useState(() => createEmptyForm(today, prefill))
  const [appointmentsOnDates, setAppointmentsOnDates] = useState<
    AppointmentRow[]
  >([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const update = <Key extends keyof typeof emptyForm>(
    key: Key,
    value: (typeof emptyForm)[Key]
  ) => setForm((prev) => ({ ...prev, [key]: value }))

  const activeServices = useMemo(
    () => services.filter((item) => item.is_active === 1),
    [services]
  )

  const {
    services: pickedServices,
    durationMinutes,
    totalPrice,
  } = useMemo(
    () => summarizeServices(activeServices, form.serviceIds),
    [activeServices, form.serviceIds]
  )
  const appointmentPrice = form.price === "" ? totalPrice : Number(form.price)

  const toggleService = (id: number) =>
    update(
      "serviceIds",
      form.serviceIds.includes(id)
        ? form.serviceIds.filter((item) => item !== id)
        : [...form.serviceIds, id]
    )

  const requestedTotal = Math.min(
    Math.max(Number(form.totalSessions) || 0, 0),
    MAX_SESSIONS
  )

  const weeklySessions = useMemo(
    () =>
      generateWeeklySessions(form.startDate[0], form.weekdays, requestedTotal),
    [form.startDate, form.weekdays, requestedTotal]
  )

  const sessions = useMemo(
    () => (form.mode === "dates" ? uniqueDates(form.dates) : weeklySessions),
    [form.mode, form.dates, weeklySessions]
  )

  useEffect(() => {
    if (!open || sessions.length === 0) return

    let active = true
    const from = startOfDay(sessions[0])
    const to = addDays(startOfDay(sessions[sessions.length - 1]), 1)

    listForRange(from, to)
      .then((rows) => {
        if (active) setAppointmentsOnDates(rows)
      })
      .catch(() => {
        if (active) setAppointmentsOnDates([])
      })

    return () => {
      active = false
    }
  }, [open, sessions])

  const therapistOptions = therapists.map((item) => ({
    value: String(item.id),
    label: item.specialty ? `${item.name} — ${item.specialty}` : item.name,
  }))

  const selectedTherapist = therapistOptions.find(
    (item) => item.value === form.therapistId
  )

  const selectedWeekdayLabels = sortWeekdays(form.weekdays)
    .map((day) => WEEKDAY_NAMES[day])
    .join("، ")

  const weeksCount =
    form.weekdays.length > 0
      ? Math.ceil(requestedTotal / form.weekdays.length)
      : 0

  const startLabel = form.time ? toFaDigits(form.time) : ""
  const endTimeLabel = useMemo(() => {
    if (!form.time) return ""
    const start = combineDateAndTime(today, form.time)
    return formatClock(addMinutes(start, durationMinutes))
  }, [form.time, durationMinutes, today])

  const timeHasConflict = (time: string) =>
    sessions.some((date) =>
      hasTimeConflict(date, time, durationMinutes, appointmentsOnDates)
    )
  const selectedTimeHasConflict = Boolean(
    form.time && timeHasConflict(form.time)
  )

  const resetForm = () => {
    setForm(createEmptyForm(today, prefill))
    setError("")
  }

  const changeOpen = (value: boolean) => {
    if (isControlled) {
      onOpenChange?.(value)
      return
    }
    setUncontrolledOpen(value)
  }

  const validate = () => {
    if (!form.fullName.trim()) {
      return "نام و نام خانوادگی مشتری را وارد کنید."
    }

    if (form.phone.trim().length > 0 && !/^09\d{9}$/.test(form.phone.trim())) {
      return "شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد."
    }

    if (!Number.isSafeInteger(appointmentPrice) || appointmentPrice < 0) {
      return "قیمت نوبت باید عددی صحیح و نامنفی باشد."
    }

    if (!form.time) {
      return "ساعت شروع را انتخاب کنید."
    }

    if (form.mode === "dates" && sessions.length === 0) {
      return "دست‌کم یک روز را از تقویم انتخاب کنید."
    }

    if (form.mode === "weekly") {
      if (!form.startDate[0]) {
        return "تاریخ شروع را انتخاب کنید."
      }
      if (form.weekdays.length === 0) {
        return "دست‌کم یک روز از هفته را انتخاب کنید."
      }
      if (requestedTotal < 1) {
        return "تعداد جلسات باید دست‌کم ۱ باشد."
      }
    }

    return ""
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const message = validate()

    if (message) {
      setError(message)
      return
    }

    const payload: NewBooking = {
      customer: {
        full_name: form.fullName.trim(),
        phone: form.phone.trim(),
        referral: form.referral.trim(),
      },
      service_ids: pickedServices.map((item) => item.id),
      therapist_id: form.therapistId ? Number(form.therapistId) : null,
      appointment: {
        status: form.status,
        notes: form.notes.trim(),
        price: appointmentPrice,
      },
      sessions: sessions.map((date): SessionRange => {
        const start = combineDateAndTime(date, form.time)
        const end = addMinutes(start, durationMinutes)

        return {
          start_at: start.toISOString(),
          end_at: end.toISOString(),
          preview: formatSession(date),
        }
      }),
    }

    try {
      setLoading(true)
      setError("")
      await onCreate(payload)
      resetForm()
      changeOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت نوبت با خطا مواجه شد.")
    } finally {
      setLoading(false)
    }
  }

  const submitLabel = loading
    ? "در حال ثبت..."
    : sessions.length > 1
      ? `ثبت ${toFa(sessions.length)} جلسه`
      : "ثبت نوبت"

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (loading) return
        changeOpen(value)
        if (!value) resetForm()
      }}
    >
      {isControlled ? null : (
        <DialogTrigger
          render={
            <Button className={triggerClassName}>
              <CalendarDays className="size-4" />
              {trigger ?? title}
            </Button>
          }
        />
      )}

      <DialogContent
        dir="rtl"
        className="flex max-h-[94dvh] w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:w-[calc(100%-2rem)] md:max-w-5xl xl:max-w-6xl"
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="shrink-0 flex-row items-center gap-3 border-b bg-card px-4 py-4 text-right sm:px-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CalendarDays className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold sm:text-lg">
                {title}
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                مشتری، خدمت و زمان‌بندی را به ترتیب تکمیل کنید.
              </p>
            </div>
          </DialogHeader>

          <div className="grid min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
            <div className="divide-y divide-border/70 p-4 sm:p-6 lg:overflow-y-auto [&>section]:border-border/70">
              <Step
                index={1}
                icon={User}
                title="مشتری"
                hint="جست‌وجو در مشتریان قبلی یا ثبت مشتری جدید"
              >
                <Field label="نام و نام خانوادگی" htmlFor="customer-name" required>
                  <CustomerSearch
                    value={form.fullName}
                    onValueChange={(value) => update("fullName", value)}
                    onSelect={(customer) => {
                      if (customer.phone.length > 0) {
                        update("phone", customer.phone)
                      }
                      update("referral", customer.referral ?? "")
                    }}
                    inputClassName={cn(inputClass, "ps-9 text-start")}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="شماره موبایل (اختیاری)" htmlFor="customer-phone">
                    <IconInputWrap icon={Phone}>
                      <PersianNumberInput
                        id="customer-phone"
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        value={form.phone}
                        onValueChange={(value) => update("phone", value)}
                        maxLength={11}
                        className={cn(inputClass, "pr-10 pl-3 text-left tabular-nums")}
                      />
                    </IconInputWrap>
                  </Field>

                  <Field label="معرفی‌شده توسط (اختیاری)" htmlFor="referral">
                    <IconInputWrap icon={UserRound}>
                      <Input
                        id="referral"
                        type="text"
                        dir="rtl"
                        value={form.referral}
                        placeholder="نام معرف"
                        onChange={(event) => update("referral", event.target.value)}
                        className={cn(inputClass, "pr-10")}
                      />
                    </IconInputWrap>
                  </Field>
                </div>
              </Step>

              <Step
                index={2}
                icon={Sparkles}
                title="خدمت و متخصص"
                hint={
                  pickedServices.length > 0
                    ? `${toFa(pickedServices.length)} خدمت • ${toFa(durationMinutes)} دقیقه`
                    : `بدون انتخاب خدمت، مدت جلسه ${toFa(DEFAULT_SESSION_MINUTES)} دقیقه است.`
                }
              >
                <Field label="خدمات ماساژ (چند انتخابی)">
                  <ServicePicker
                    services={activeServices}
                    selectedIds={form.serviceIds}
                    onToggle={toggleService}
                    onClear={() => update("serviceIds", [])}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="متخصص ماساژ (اختیاری)">
                    <Select
                      items={therapistOptions}
                      value={form.therapistId}
                      onValueChange={(value) =>
                        update("therapistId", value ? String(value) : "")
                      }
                    >
                      <SelectTrigger className={cn(inputClass, "w-full")}>
                        <SelectValue placeholder="انتخاب متخصص" />
                      </SelectTrigger>
                      <SelectContent>
                        {therapistOptions.length === 0 ? (
                          <SelectItem value="__none__" disabled>
                            هنوز متخصصی ثبت نشده است
                          </SelectItem>
                        ) : (
                          therapistOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field
                    label="قیمت هر جلسه"
                    htmlFor="appointment-price"
                    hint={
                      <span id="appointment-price-hint">
                        مجموع خدمات انتخاب‌شده: {toFa(totalPrice)} تومان
                      </span>
                    }
                  >
                    <div className="relative">
                      <PersianNumberInput
                        id="appointment-price"
                        value={form.price === "" ? String(totalPrice) : form.price}
                        onValueChange={(value) => update("price", value)}
                        className={cn(inputClass, "pl-16 text-left tabular-nums")}
                        aria-describedby="appointment-price-hint"
                      />
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                        تومان
                      </span>
                    </div>
                  </Field>
                </div>
              </Step>

              <Step
                index={3}
                icon={Repeat}
                title="زمان‌بندی"
                hint="روزهای جلسات و ساعت شروع"
              >
                <div
                  role="tablist"
                  aria-label="نوع زمان‌بندی"
                  className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
                >
                  {(
                    [
                      ["dates", "انتخاب از تقویم"],
                      ["weekly", "تکرار هفتگی"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      role="tab"
                      aria-selected={form.mode === value}
                      onClick={() => update("mode", value)}
                      className={cn(
                        "h-9 rounded-md text-sm font-medium outline-none transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-ring",
                        form.mode === value
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {form.mode === "dates" ? (
                  <Field label="تاریخ جلسات (امکان انتخاب چند روز)">
                    <DatePicker
                      mode="multiple"
                      value={form.dates}
                      onChange={(value) => update("dates", value)}
                      minDate={today}
                      allowPast={true}
                      maxSelection={MAX_SESSIONS}
                      placeholder="انتخاب روزها"
                    />
                  </Field>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
                      <Field label="تاریخ شروع">
                        <DatePicker
                          mode="single"
                          value={form.startDate}
                          onChange={(value) => update("startDate", value)}
                          minDate={today}
                          allowPast={true}
                          placeholder="انتخاب تاریخ شروع"
                          className="w-full"
                        />
                      </Field>

                      <Field label="تعداد جلسات" htmlFor="total-sessions">
                        <PersianNumberInput
                          id="total-sessions"
                          className={cn(inputClass, "text-center text-base")}
                          value={form.totalSessions}
                          onValueChange={(value) => update("totalSessions", value)}
                        />
                      </Field>
                    </div>

                    <Field label="روزهای هفته">
                      <WeekdaysPicker
                        value={form.weekdays}
                        onChange={(value) => update("weekdays", value)}
                      />
                    </Field>

                    {form.weekdays.length > 0 && requestedTotal > 0 && (
                      <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs leading-6 text-muted-foreground">
                        هفته‌ای {toFa(form.weekdays.length)} جلسه (
                        {selectedWeekdayLabels}) — حدود {toFa(weeksCount)} هفته
                      </p>
                    )}
                  </div>
                )}

                {/* Time */}
                <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-40">
                      <Input
                        id="session-time"
                        type="time"
                        dir="ltr"
                        value={form.time}
                        onChange={(event) => update("time", event.target.value)}
                        aria-label="ساعت شروع"
                        aria-invalid={selectedTimeHasConflict}
                        className={cn(
                          "h-12 rounded-lg border-2 bg-background pr-10 pl-3 text-center text-xl font-semibold tracking-wider tabular-nums",
                          selectedTimeHasConflict && "border-destructive",
                          "focus-visible:border-primary",
                          !form.time && "text-muted-foreground",
                          "[&::-webkit-calendar-picker-indicator]:absolute",
                          "[&::-webkit-calendar-picker-indicator]:inset-0",
                          "[&::-webkit-calendar-picker-indicator]:h-full",
                          "[&::-webkit-calendar-picker-indicator]:w-full",
                          "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
                          "[&::-webkit-calendar-picker-indicator]:opacity-0"
                        )}
                      />
                      <Clock className="pointer-events-none absolute inset-y-0 right-3 my-auto size-4 text-primary" />
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {endTimeLabel ? (
                        <>
                          پایان جلسه:{" "}
                          <span className="font-semibold text-foreground tabular-nums">
                            {endTimeLabel}
                          </span>
                        </>
                      ) : (
                        "ساعت شروع را انتخاب کنید."
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {QUICK_TIMES.map((time) => {
                      const active = form.time === time
                      const busy = timeHasConflict(time)
                      return (
                        <button
                          key={time}
                          type="button"
                          aria-pressed={active}
                          aria-label={`${toFaDigits(time)}${busy ? "، تداخل با نوبت رزروشده" : ""}`}
                          title={busy ? "با یک نوبت زمان‌بندی‌شده تداخل دارد" : undefined}
                          onClick={() => update("time", time)}
                          className={cn(
                            "h-9 rounded-lg border text-sm tabular-nums outline-none transition-colors",
                            "focus-visible:ring-2 focus-visible:ring-ring",
                            busy
                              ? active
                                ? "border-destructive bg-destructive font-medium text-white"
                                : "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15"
                              : active
                                ? "border-transparent bg-primary font-medium text-primary-foreground"
                                : "bg-background hover:bg-muted"
                          )}
                        >
                          {toFaDigits(time)}
                        </button>
                      )
                    })}
                  </div>

                  {sessions.length > 0 && (
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="size-2 shrink-0 rounded-full bg-destructive" />
                      ساعت قرمز در یکی از روزهای انتخابی با نوبت دیگری تداخل دارد.
                    </p>
                  )}
                  {selectedTimeHasConflict && (
                    <p role="alert" className="text-xs font-medium text-destructive">
                      ساعت انتخاب‌شده با نوبت دیگری تداخل دارد؛ ساعت دیگری انتخاب کنید.
                    </p>
                  )}
                </div>
              </Step>

              {/* 4 — Notes */}
              <Step index={4} icon={StickyNote} title="یادداشت" hint="اختیاری">
                <Textarea
                  id="appointment-notes"
                  aria-label="یادداشت نوبت"
                  placeholder="توضیحات مربوط به این رزرو..."
                  value={form.notes}
                  onChange={(event) => update("notes", event.target.value)}
                  rows={3}
                  maxLength={2000}
                  className="resize-none rounded-lg bg-background"
                />
              </Step>
            </div>
          </div>

          <footer className="shrink-0 border-t bg-card">
            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 border-b border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive sm:px-6"
              >
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 flex-1 rounded-lg px-8 sm:flex-none"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CalendarCheck2 className="size-4" />
                  )}
                  {submitLabel}
                </Button>
                <DialogClose
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      disabled={loading}
                      className="h-11 rounded-lg px-5"
                    >
                      انصراف
                    </Button>
                  }
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Wallet className="size-4" />
                </span>
                <div className="text-xs leading-5 text-muted-foreground">
                  <div className="tabular-nums">
                    {toFa(appointmentPrice)} تومان × {toFa(Math.max(sessions.length, 1))} جلسه
                  </div>
                  <div className="text-sm font-bold text-foreground tabular-nums">
                    مجموع: {toFa(appointmentPrice * Math.max(sessions.length, 1))} تومان
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  )
}
