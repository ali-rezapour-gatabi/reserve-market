import Header from "@/components/header"
import { AppSidebar } from "@/components/app-sidebar"

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="min-h-screen bg-muted/40">
      <div className="mx-auto flex min-h-screen flex-col lg:flex-row">
        <AppSidebar className="lg:sticky lg:top-0 lg:h-screen lg:w-74 lg:shrink-0 lg:rounded-none lg:border-y-0 lg:border-s-0 lg:border-e lg:bg-card lg:p-4" />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <div className="w-full flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1600px]">{children}</div>
          </div>
        </div>
      </div>
    </main>
  )
}
