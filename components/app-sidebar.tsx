"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarClock, ContactRound, Sparkles, Users } from "lucide-react"

import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  {
    href: "/",
    label: "داشبورد",
    icon: CalendarClock,
  },
  {
    href: "/services",
    label: "سرویس‌ها",
    icon: Sparkles,
  },
  {
    href: "/customers",
    label: "مشتریان",
    icon: ContactRound,
  },
  {
    href: "/therapists",
    label: "متخصص‌ها",
    icon: Users,
  },
]

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "shrink-0 border-b border-border bg-card p-2 sm:p-2.5 lg:border-b-0",
        className
      )}
    >
      <div className="hidden items-center gap-3 px-2 pb-6 pt-2 lg:flex">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CalendarClock className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">اطلس ماساژ</p>
          <p className="truncate text-xs text-muted-foreground">مدیریت مرکز</p>
        </div>
      </div>
      <p className="hidden px-3 pb-2 text-xs font-medium text-muted-foreground lg:block">
        فضای کاری
      </p>
      <nav aria-label="منوی اصلی" className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)

          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              <Icon className="size-[18px] shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
