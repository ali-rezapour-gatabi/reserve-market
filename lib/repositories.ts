import type {
  AppointmentEdit,
  AppointmentRow,
  AppointmentStatus,
  Customer,
  CustomerInput,
  CustomerListRow,
  NewBooking,
  Service,
  ServiceInput,
  Therapist,
  TherapistInput,
} from "@/lib/types"

export type {
  AppointmentEdit,
  AppointmentRow,
  AppointmentStatus,
  Customer,
  CustomerInput,
  CustomerListRow,
  NewBooking,
  Service,
  ServiceInput,
  SessionRange,
  Therapist,
  TherapistInput,
} from "@/lib/types"

async function rpc<T>(action: string, args: unknown[] = []): Promise<T> {
  const response = await fetch("/api/rpc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, args }),
    cache: "no-store",
  })

  const payload = (await response.json().catch(() => null)) as
    | { result?: T; error?: string }
    | null

  if (!response.ok) {
    throw new Error(payload?.error ?? "درخواست با خطا مواجه شد.")
  }

  return payload?.result as T
}

export function listAllServices() {
  return rpc<Service[]>("listAllServices")
}

export function listServices() {
  return rpc<Service[]>("listServices")
}

export function createService(input: ServiceInput) {
  return rpc<Service[]>("createService", [input])
}

export function updateService(id: number, input: ServiceInput) {
  return rpc<Service[]>("updateService", [id, input])
}

export function setServiceActive(id: number, active: boolean) {
  return rpc<Service[]>("setServiceActive", [id, active])
}

export function deleteService(id: number) {
  return rpc<Service[]>("deleteService", [id])
}

export function listAllTherapists() {
  return rpc<Therapist[]>("listAllTherapists")
}

export function listTherapists() {
  return rpc<Therapist[]>("listTherapists")
}

export function createTherapist(input: TherapistInput) {
  return rpc<Therapist[]>("createTherapist", [input])
}

export function updateTherapist(id: number, input: TherapistInput) {
  return rpc<Therapist[]>("updateTherapist", [id, input])
}

export function setTherapistActive(id: number, active: boolean) {
  return rpc<Therapist[]>("setTherapistActive", [id, active])
}

export function deleteTherapist(id: number) {
  return rpc<Therapist[]>("deleteTherapist", [id])
}

export function listCustomers(limit = 20) {
  return rpc<Customer[]>("listCustomers", [limit])
}

export function listAllCustomers() {
  return rpc<CustomerListRow[]>("listAllCustomers")
}

export function updateCustomer(id: number, input: CustomerInput) {
  return rpc<CustomerListRow[]>("updateCustomer", [id, input])
}

export function searchCustomers(query: string, limit = 8) {
  return rpc<Customer[]>("searchCustomers", [query, limit])
}

export function createBooking(booking: NewBooking) {
  return rpc<number>("createBooking", [booking])
}

export function updateAppointment(id: number, input: AppointmentEdit) {
  return rpc<void>("updateAppointment", [id, input])
}

export function listForRange(from: Date, to: Date) {
  return rpc<AppointmentRow[]>("listForRange", [
    from.toISOString(),
    to.toISOString(),
  ])
}

export function listBookingSessions(slug: string) {
  return rpc<AppointmentRow[]>("listBookingSessions", [slug])
}

export function listCustomerAppointments(customerId: number) {
  return rpc<AppointmentRow[]>("listCustomerAppointments", [customerId])
}

export function listAllAppointments(limit = 500) {
  return rpc<AppointmentRow[]>("listAllAppointments", [limit])
}

export function setAppointmentStatus(id: number, status: AppointmentStatus) {
  return rpc<void>("setAppointmentStatus", [id, status])
}

export function deleteAppointment(id: number) {
  return rpc<void>("deleteAppointment", [id])
}

export function completeDayAppointments(from: Date, to: Date) {
  return rpc<number>("completeDayAppointments", [
    from.toISOString(),
    to.toISOString(),
  ])
}

export function reopenDayAppointments(from: Date, to: Date) {
  return rpc<number>("reopenDayAppointments", [
    from.toISOString(),
    to.toISOString(),
  ])
}

export function deleteCustomer(id: number) {
  return rpc<CustomerListRow[]>("deleteCustomer", [id])
}
