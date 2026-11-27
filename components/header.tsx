"use client"

import React from "react"
import { CalendarDays, Leaf } from "lucide-react"
import { formatNumericDate } from "@/lib/jalali"
import { weekdayName } from "@/lib/schedule"

const Header: React.FC = () => {
  const now = new Date()
  const persianDate = `${weekdayName(now)}، ${formatNumericDate(now)}`

  return (
    <header className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm shadow-foreground/[0.02] sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <Leaf className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <span className="block truncate text-base font-bold tracking-tight sm:text-lg">اطلس ماساژ</span>
          <p className="mt-0.5 text-xs text-muted-foreground">مدیریت هوشمند مرکز شما</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 rounded-xl bg-muted/70 px-3 py-2 text-xs font-medium text-muted-foreground sm:gap-2.5 sm:px-4 sm:text-sm" dir="rtl" suppressHydrationWarning>
        <CalendarDays className="size-4 text-primary" aria-hidden="true" />
        <span>{persianDate}</span>
      </div>
    </header>
  )
}

export default Header
