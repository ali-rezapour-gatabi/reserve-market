"use client"

import * as React from "react"
import { CircleAlert, CircleCheck, Info, X } from "lucide-react"

import { cn } from "@/lib/utils"

export type ToastKind = "success" | "error" | "info"

type ToastItem = {
  id: number
  kind: ToastKind
  text: string
}

type ToastApi = {
  show: (text: string, kind?: ToastKind) => number
  success: (text: string) => number
  error: (text: string) => number
  info: (text: string) => number
  dismiss: (id: number) => void
}

const ToastContext = React.createContext<ToastApi | null>(null)

const TOAST_DURATION = 5000

export function useToast() {
  const api = React.useContext(ToastContext)

  if (!api) {
    throw new Error("useToast باید داخل ToastProvider استفاده شود.")
  }

  return api
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])
  const counter = React.useRef(0)
  const timers = React.useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = React.useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id))

    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const show = React.useCallback(
    (text: string, kind: ToastKind = "info") => {
      const id = ++counter.current

      setToasts((current) => [...current, { id, kind, text }])

      const timer = setTimeout(() => dismiss(id), TOAST_DURATION)
      timers.current.set(id, timer)

      return id
    },
    [dismiss]
  )

  React.useEffect(() => {
    const activeTimers = timers.current

    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer))
      activeTimers.clear()
    }
  }, [])

  const api = React.useMemo<ToastApi>(
    () => ({
      show,
      success: (text) => show(text, "success"),
      error: (text) => show(text, "error"),
      info: (text) => show(text, "info"),
      dismiss,
    }),
    [show, dismiss]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-100 flex flex-col items-center gap-2 sm:inset-x-auto sm:inset-e-6 sm:items-end">
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem
  onDismiss: (id: number) => void
}) {
  const isError = item.kind === "error"
  const Icon = isError
    ? CircleAlert
    : item.kind === "success"
      ? CircleCheck
      : Info

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={cn(
        "pointer-events-auto flex w-full animate-in items-start gap-3 rounded-lg border bg-card p-3 text-sm shadow-lg fade-in slide-in-from-bottom-2 sm:max-w-md",
        isError
          ? "border-destructive/30 text-destructive"
          : "border-primary/30 text-foreground"
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-5 shrink-0",
          isError ? "text-destructive" : "text-primary"
        )}
      />
      <p className="min-w-0 flex-1 leading-6">{item.text}</p>
      <button
        type="button"
        aria-label="بستن پیام"
        onClick={() => onDismiss(item.id)}
        className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
