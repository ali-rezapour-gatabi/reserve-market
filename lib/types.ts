export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show"

export type Customer = {
  id: number
  full_name: string
  phone: string
  notes: string | null
  referral: string | null
  updated_at: string
}

export type CustomerInput = {
  full_name: string
  phone: string
  referral: string
}

export type CustomerListRow = Customer & {
  total_sessions: number
  completed_sessions: number
  last_session_at: string | null
}

export type Service = {
  id: number
  name: string
  description: string | null
  duration_minutes: number
  price: number
  is_active: number
}

export type Therapist = {
  id: number
  name: string
  specialty: string | null
  phone: string | null
  description: string | null
  is_active: number
}

export type ServiceInput = {
  name: string
  description: string
  duration_minutes: number
  price: number
}

export type TherapistInput = {
  name: string
  specialty: string
  phone: string
  description: string
}

export type SessionRange = {
  start_at: string
  end_at: string
  preview: string
}

export type NewBooking = {
  customer: {
    full_name: string
    phone: string
    referral: string
  }
  service_ids: number[]
  therapist_id: number | null
  appointment: {
    status: AppointmentStatus
    notes: string
    price: number
  }
  sessions: SessionRange[]
}

export type AppointmentEdit = {
  service_ids: number[]
  price: number
  therapist_id: number | null
  start_at: string
  end_at: string
  status: AppointmentStatus
  notes: string
}

export type AppointmentRow = {
  id: number
  slug: string | null
  start_at: string
  end_at: string
  price: number
  status: AppointmentStatus
  service_ids: number[]
  service_names: string[]
  full_name: string
  phone: string
  notes: string | null
  referral?: string | null
  therapist_id: number | null
  therapist_name: string | null
  remaining?: number
}
