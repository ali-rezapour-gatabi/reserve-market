import type { Metadata } from "next"

import "./globals.css"
import { DirectionProvider } from "@/components/ui/direction"

export const metadata: Metadata = {
  title: "اطلس ماساژ | مدیریت مرکز",
  description: "داشبورد مدیریت نوبت‌ها، مشتریان، خدمات و متخصصان مرکز ماساژ",
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
