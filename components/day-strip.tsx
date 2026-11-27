"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { addDays, isSameDay } from "date-fns"
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react"

import { JalaliCalendar } from "@/components/jalali-calendar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  formatNumericDate,
  formatNumericMonth,
  jalaliParts,
  startOfJalaliMonth,
  toFa,
} from "@/lib/jalali"
import { useLocalDay } from "@/lib/use-local-day"

const WEEKDAY_SHORT_BY_DAY = ["ی", "د", "س", "چ", "پ", "ج", "ش"]
const WEEKDAY_SHORT_SATURDAY_FIRST = ["ش", "ی", "د", "س", "چ", "پ", "ج"]

function jalaliMonthLength(monthStart: Date) {
  const { jm } = jalaliParts(monthStart)
  let length = 29
  while (jalaliParts(addDays(monthStart, length)).jm === jm) length++
  return length
}

type DayStripProps = {
  selected: Date | null
  onSelect: (date: Date) => void
  className?: string
}

export function DayStrip({ selected, onSelect, className }: DayStripProps) {
  const today = useLocalDay()
  const [monthStartOverride, setMonthStartOverride] = useState<Date | null>(null)
  const [monthExpanded, setMonthExpanded] = useState(false)
  const [mobileCalendarOpen, setMobileCalendarOpen] = useState(false)
  const monthStart =
    monthStartOverride ?? startOfJalaliMonth(today)

  const monthLength = useMemo(() => jalaliMonthLength(monthStart), [monthStart])

  const days = useMemo(
    () => Array.from({ length: monthLength }, (_, i) => addDays(monthStart, i)),
    [monthStart, monthLength]
  )
  const monthParts = jalaliParts(monthStart)
  const firstWeekday = (monthStart.getDay() + 1) % 7
  const weeks = useMemo(
    () =>
      Array.from(
        { length: Math.ceil((monthLength + firstWeekday) / 7) },
        (_, weekIndex) =>
          Array.from({ length: 7 }, (_, weekdayIndex) =>
            addDays(monthStart, weekIndex * 7 + weekdayIndex - firstWeekday)
          )
      ),
    [firstWeekday, monthLength, monthStart]
  )
  const selectedParts = selected ? jalaliParts(selected) : null
  const anchorDay =
    selectedParts?.jy === monthParts.jy && selectedParts.jm === monthParts.jm
      ? selectedParts.jd
      : jalaliParts(today).jy === monthParts.jy &&
        jalaliParts(today).jm === monthParts.jm
        ? jalaliParts(today).jd
        : 1
  const activeWeekIndex = Math.floor((firstWeekday + anchorDay - 1) / 7)
  const activeWeek = weeks[activeWeekIndex] ?? weeks[0]
  const { jy, jm } = monthParts

  const handleSelectDay = (day: Date) => {
    const parts = jalaliParts(day)
    if (parts.jy !== jy || parts.jm !== jm) {
      setMonthStartOverride(startOfJalaliMonth(day))
    }
    setMonthExpanded(false)
    onSelect(day)
  }

  const changeWeek = (amount: number) => {
    const weekStart = activeWeek?.[0]
    if (!weekStart) return

    const target = addDays(weekStart, amount * 7)
    setMonthStartOverride(startOfJalaliMonth(target))
    onSelect(target)
  }

  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = scrollRef.current
    const target =
      container?.querySelector<HTMLElement>("[aria-pressed='true']") ??
      container?.querySelector<HTMLElement>("[data-today='true']")

    if (!container || !target) return

    const containerRect = container.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    container.scrollBy({
      left:
        targetRect.left -
        containerRect.left -
        (containerRect.width - targetRect.width) / 2,
      behavior: "smooth",
    })
  }, [monthStart, selected])

  const goNext = () => {
    setMonthExpanded(false)
    setMonthStartOverride(startOfJalaliMonth(addDays(monthStart, monthLength)))
  }
  const goPrev = () => {
    setMonthExpanded(false)
    setMonthStartOverride(startOfJalaliMonth(addDays(monthStart, -1)))
  }
  const goToday = () => {
    setMonthStartOverride(null)
    setMonthExpanded(false)
    onSelect(today)
  }

  const renderDay = (day: Date, inCurrentMonth: boolean, tablet = false) => {
    const { jd, jy: dayYear, jm: dayMonth } = jalaliParts(day)
    const isToday = isSameDay(day, today)
    const isSelected = selected !== null && isSameDay(day, selected)
    const isPast = day < today
    const monthLabel = formatNumericMonth(dayYear, dayMonth)

    return (
      <button
        key={day.toISOString()}
        type="button"
        aria-pressed={isSelected}
        data-today={isToday}
        aria-label={`${WEEKDAY_SHORT_BY_DAY[day.getDay()]}، ${toFa(jd)} ${monthLabel}`}
        onClick={() => handleSelectDay(day)}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
          tablet
            ? "min-w-0 rounded-lg px-1 py-2"
            : "h-16 w-14 shrink-0 rounded-lg",
          isSelected
            ? "border-primary bg-primary font-medium text-primary-foreground shadow-sm"
            : "border-transparent bg-muted/50 hover:bg-muted",
          isPast && !isSelected && "opacity-60",
          !inCurrentMonth && !isSelected && "opacity-35",
          isToday &&
          !isSelected &&
          "border-secondary bg-secondary/30 font-medium text-secondary-foreground opacity-100"
        )}
      >
        <span className="text-[11px] leading-none opacity-80">
          {WEEKDAY_SHORT_BY_DAY[day.getDay()]}
        </span>
        <span className={cn("leading-none tabular-nums", tablet ? "text-base" : "text-lg")}>
          {toFa(jd)}
        </span>
      </button>
    )
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border bg-card text-card-foreground",
        className
      )}
    >
      <div className="hidden flex-wrap items-center justify-between gap-3 border-b px-4 py-3 md:flex">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarDays className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">انتخاب روز</h2>
            <p className="text-xs text-muted-foreground">
              {formatNumericMonth(jy, jm)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" onClick={goToday}>
            امروز
          </Button>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={goPrev}
              aria-label="ماه قبل"
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={goNext}
              aria-label="ماه بعد"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="border-b px-3 py-2.5 md:hidden">
        <button
          type="button"
          aria-label={`انتخاب تاریخ ${formatNumericDate(selected ?? today)}`}
          aria-haspopup="dialog"
          aria-expanded={mobileCalendarOpen}
          onClick={() => setMobileCalendarOpen(true)}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-semibold tabular-nums outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CalendarDays className="size-4 text-primary" aria-hidden="true" />
          <span>{formatNumericDate(selected ?? today)}</span>
        </button>
      </div>

      <Dialog open={mobileCalendarOpen} onOpenChange={setMobileCalendarOpen}>
        <DialogContent dir="rtl" className="max-w-sm gap-4">
          <DialogHeader>
            <DialogTitle>انتخاب تاریخ</DialogTitle>
          </DialogHeader>
          <JalaliCalendar
            selected={selected ? [selected] : []}
            initialMonth={selected ?? today}
            onSelect={(day) => {
              handleSelectDay(day)
              setMobileCalendarOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>

      <div className="hidden border-b px-4 py-4 md:block lg:hidden">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            هفته {toFa(activeWeekIndex + 1)} از {toFa(weeks.length)}
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={() => changeWeek(-1)}
              aria-label="هفته قبل"
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={() => changeWeek(1)}
              aria-label="هفته بعد"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2" role="group" aria-label="روزهای این هفته">
          {activeWeek?.map((day) => {
            const parts = jalaliParts(day)
            return renderDay(day, parts.jy === jy && parts.jm === jm, true)
          })}
        </div>

        <button
          type="button"
          aria-expanded={monthExpanded}
          aria-controls="tablet-month-grid"
          onClick={() => setMonthExpanded((expanded) => !expanded)}
          className="mt-3 flex w-full items-center justify-between rounded-lg border-t px-1 pt-3 text-sm font-medium text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span>{monthExpanded ? "بستن تقویم ماه" : "نمایش همهٔ روزهای ماه"}</span>
          {monthExpanded ? (
            <ChevronUp className="size-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="size-4" aria-hidden="true" />
          )}
        </button>

        <div
          id="tablet-month-grid"
          hidden={!monthExpanded}
          className="mt-3 rounded-lg bg-muted/30 p-3"
        >
          <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground">
            {WEEKDAY_SHORT_SATURDAY_FIRST.map((weekday, index) => (
              <span key={`${weekday}-${index}`} className="py-1">
                {weekday}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {weeks.flatMap((week) =>
              week.map((day) => {
                const parts = jalaliParts(day)
                return renderDay(day, parts.jy === jy && parts.jm === jm, true)
              })
            )}
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="hidden gap-2 overflow-x-auto px-4 py-5 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40 md:hidden lg:flex"
        aria-label="روزهای ماه"
      >
        {days.map((day) => renderDay(day, true))}
      </div>
    </section>
  )
}
