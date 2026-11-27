"use client"

import React from "react"
import { CalendarDays, Leaf } from "lucide-react"
import { formatNumericDate } from "@/lib/jalali"
import { weekdayName } from "@/lib/schedule"
import { useLocalDay } from "@/lib/use-local-day"

const Header: React.FC = () => {
  const today = useLocalDay()
  const persianDate = `${weekdayName(today)}، ${formatNumericDate(today)}`

  return (
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-border bg-card px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
        <Leaf className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="truncate font-medium text-foreground">اطلس ماساژ</span>
        <span aria-hidden="true">/</span>
        <span className="hidden truncate sm:inline">مدیریت هوشمند مرکز شما</span>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground sm:text-sm" dir="rtl">
        <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
        <span>{persianDate}</span>
      </div>
    </header>
  )
}

export default Header
