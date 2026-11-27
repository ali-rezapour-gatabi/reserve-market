"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarClock, ContactRound, Menu, Sparkles, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
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
  const [mobileOpen, setMobileOpen] = useState(false)

  const navigation = (mobile = false) => (
    <nav aria-label="منوی اصلی" className="flex flex-col gap-1">
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
            onClick={() => mobile && setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors outline-none",
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
  )

  return (
    <aside
      className={cn(
        "shrink-0 border-b border-border bg-card px-3 py-2 lg:border-b-0",
        className
      )}
    >
      <div className="flex items-center justify-between lg:hidden">
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar-navigation"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-4" aria-hidden="true" />
          منو
        </Button>
        <span className="text-xs text-muted-foreground">دسترسی سریع به بخش‌ها</span>
      </div>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent
          id="mobile-sidebar-navigation"
          dir="rtl"
          className="inset-y-0 start-0 top-0 flex h-dvh w-[min(18rem,85vw)] max-w-none translate-x-0 translate-y-0 flex-col items-stretch gap-5 rounded-none border-e p-4 sm:max-w-none rtl:translate-x-0"
        >
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CalendarClock className="size-5" aria-hidden="true" />
            </span>
            <div>
              <DialogTitle className="text-sm font-semibold">اطلس ماساژ</DialogTitle>
              <p className="mt-1 text-xs text-muted-foreground">مدیریت مرکز</p>
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground">فضای کاری</p>
          {navigation(true)}
        </DialogContent>
      </Dialog>

      <div className="hidden lg:block">
        <div className="flex items-center gap-3 px-2 pb-6 pt-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CalendarClock className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">اطلس ماساژ</p>
            <p className="truncate text-xs text-muted-foreground">مدیریت مرکز</p>
          </div>
        </div>
        <p className="px-3 pb-2 text-xs font-medium text-muted-foreground">فضای کاری</p>
        {navigation()}
      </div>
    </aside>
  )
}
