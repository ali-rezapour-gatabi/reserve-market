import Header from "@/components/header"
import { AppSidebar } from "@/components/app-sidebar"

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="min-h-screen bg-background px-3 py-4 sm:px-5 lg:px-8 lg:py-6">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5">
        <Header />

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <AppSidebar className="lg:sticky lg:top-6 lg:w-60" />

          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </main>
  )
}
