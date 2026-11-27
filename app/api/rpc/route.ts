import * as repository from "@/lib/server/repository"

export const runtime = "nodejs"

const actions = {
  listAllServices: repository.listAllServices,
  listServices: repository.listServices,
  createService: repository.createService,
  updateService: repository.updateService,
  setServiceActive: repository.setServiceActive,
  deleteService: repository.deleteService,
  listAllTherapists: repository.listAllTherapists,
  listTherapists: repository.listTherapists,
  createTherapist: repository.createTherapist,
  updateTherapist: repository.updateTherapist,
  setTherapistActive: repository.setTherapistActive,
  deleteTherapist: repository.deleteTherapist,
  listCustomers: repository.listCustomers,
  listAllCustomers: repository.listAllCustomers,
  updateCustomer: repository.updateCustomer,
  searchCustomers: repository.searchCustomers,
  createBooking: repository.createBooking,
  updateAppointment: repository.updateAppointment,
  listForRange: repository.listForRange,
  listBookingSessions: repository.listBookingSessions,
  listCustomerAppointments: repository.listCustomerAppointments,
  listAllAppointments: repository.listAllAppointments,
  setAppointmentStatus: repository.setAppointmentStatus,
  deleteAppointment: repository.deleteAppointment,
  completeDayAppointments: repository.completeDayAppointments,
  reopenDayAppointments: repository.reopenDayAppointments,
  deleteCustomer: repository.deleteCustomer,
}

type ActionName = keyof typeof actions

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: string
      args?: unknown[]
    }

    if (!body.action || !(body.action in actions)) {
      return Response.json(
        { error: "درخواست نامعتبر است." },
        { status: 400 }
      )
    }

    const handler = actions[body.action as ActionName] as (
      ...args: unknown[]
    ) => Promise<unknown>

    const result = await handler(...(body.args ?? []))

    return Response.json({ result })
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "خطای ناشناخته رخ داد.",
      },
      { status: 400 }
    )
  }
}
