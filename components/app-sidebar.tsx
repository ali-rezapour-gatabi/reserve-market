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
        "shrink-0 rounded-2xl border border-border/70 bg-card p-2.5 shadow-sm shadow-foreground/[0.02] lg:w-60 lg:p-4",
        className
      )}
    >
      <p className="hidden px-3 pb-3 pt-1 text-[11px] font-semibold tracking-wide text-muted-foreground lg:block">
        فضای کاری
      </p>
      <nav aria-label="منوی اصلی" className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-1.5">
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
                "flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition-colors outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-primary font-semibold text-primary-foreground shadow-sm shadow-primary/15"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
