"use client"

import { useMemo, useSyncExternalStore } from "react"

const SERVER_DAY = 20000101

function getLocalDaySnapshot() {
  const now = new Date()
  return now.getFullYear() * 10_000 + (now.getMonth() + 1) * 100 + now.getDate()
}

function subscribeToLocalDayChange(onChange: () => void) {
  const now = new Date()
  const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const timeout = window.setTimeout(onChange, nextDay.getTime() - now.getTime())

  return () => window.clearTimeout(timeout)
}

export function useLocalDay() {
  const dayKey = useSyncExternalStore(
    subscribeToLocalDayChange,
    getLocalDaySnapshot,
    () => SERVER_DAY
  )

  return useMemo(() => {
    const year = Math.floor(dayKey / 10_000)
    const month = Math.floor((dayKey % 10_000) / 100)
    const day = dayKey % 100

    return new Date(year, month - 1, day)
  }, [dayKey])
}
