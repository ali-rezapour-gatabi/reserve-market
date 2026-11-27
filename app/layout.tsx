import type { Metadata } from "next"

import "./globals.css"
import { DirectionProvider } from "@/components/ui/direction"

export const metadata: Metadata = {
  title: "اطلس ماساژ",
  description: "مدیریت نوبت‌ها و مشتریان سالن ماساژ",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="min-h-full">
        <DirectionProvider direction="rtl">{children}</DirectionProvider>
      </body>
    </html>
  )
}
