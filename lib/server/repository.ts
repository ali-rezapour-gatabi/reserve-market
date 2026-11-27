import { getDatabase } from "@/lib/server/db"
import { toEnDigits } from "@/lib/jalali"
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
  SessionRange,
  Therapist,
  TherapistInput,
} from "@/lib/types"

export async function listAllServices() {
  const db = getDatabase()

  return db
    .prepare(
      "SELECT id, name, description, duration_minutes, price, is_active FROM services ORDER BY id"
    )
    .all() as Service[]
}

export async function listServices() {
  const db = getDatabase()

  return db
    .prepare(
      "SELECT id, name, description, duration_minutes, price, is_active FROM services WHERE is_active = 1 ORDER BY id"
    )
    .all() as Service[]
}

function resolveServices(ids: number[]) {
  const unique = [...new Set(ids.filter((id) => Number.isFinite(id)))]

  if (unique.length === 0) {
    return { services: [] as Service[], price: 0 }
  }

  const db = getDatabase()
  const placeholders = unique.map(() => "?").join(", ")
  const rows = db
    .prepare(
      `SELECT id, name, description, duration_minutes, price, is_active FROM services WHERE id IN (${placeholders})`
    )
    .all(...unique) as Service[]

  const services = unique
    .map((id) => rows.find((item) => item.id === id))
    .filter((item): item is Service => item !== undefined)

  if (services.length < unique.length) {
    throw new Error("بعضی از خدمات انتخاب‌شده در پایگاه داده پیدا نشد.")
  }

  return {
    services,
    price: services.reduce((sum, item) => sum + item.price, 0),
  }
}

export async function createService(input: ServiceInput) {
  const db = getDatabase()

  db.prepare(
    "INSERT INTO services (name, description, duration_minutes, price) VALUES (?, ?, ?, ?)"
  ).run(
    input.name,
    input.description.length > 0 ? input.description : null,
    input.duration_minutes,
    input.price
  )

  return listAllServices()
}

export async function updateService(id: number, input: ServiceInput) {
  const db = getDatabase()

  db.prepare(
    "UPDATE services SET name = ?, description = ?, duration_minutes = ?, price = ?, updated_at = ? WHERE id = ?"
  ).run(
    input.name,
    input.description.length > 0 ? input.description : null,
    input.duration_minutes,
    input.price,
    new Date().toISOString(),
    id
  )

  return listAllServices()
}

export async function setServiceActive(id: number, active: boolean) {
  const db = getDatabase()

  db.prepare(
    "UPDATE services SET is_active = ?, updated_at = ? WHERE id = ?"
  ).run(active ? 1 : 0, new Date().toISOString(), id)

  return listAllServices()
}

export async function deleteService(id: number) {
  const db = getDatabase()

  const referencing = db
    .prepare(
      "SELECT COUNT(*) AS count FROM appointment_services WHERE service_id = ?"
    )
    .get(id) as { count: number }

  if ((referencing?.count ?? 0) > 0) {
    throw new Error(
      "این خدمت در نوبت‌ها استفاده شده است؛ نمی‌توان آن را حذف کرد. به‌جای حذف، آن را غیرفعال کنید."
    )
  }

  db.prepare("DELETE FROM services WHERE id = ?").run(id)

  return listAllServices()
}

export async function listAllTherapists() {
  const db = getDatabase()

  return db
    .prepare(
      "SELECT id, name, specialty, phone, description, is_active FROM therapists ORDER BY id"
    )
    .all() as Therapist[]
}

export async function listTherapists() {
  const db = getDatabase()

  return db
    .prepare(
      "SELECT id, name, specialty, phone, description, is_active FROM therapists WHERE is_active = 1 ORDER BY id"
    )
    .all() as Therapist[]
}

export async function createTherapist(input: TherapistInput) {
  const db = getDatabase()

  db.prepare(
    "INSERT INTO therapists (name, specialty, phone, description) VALUES (?, ?, ?, ?)"
  ).run(
    input.name,
    input.specialty.length > 0 ? input.specialty : null,
    input.phone.length > 0 ? input.phone : null,
    input.description.length > 0 ? input.description : null
  )

  return listAllTherapists()
}

export async function updateTherapist(id: number, input: TherapistInput) {
  const db = getDatabase()

  db.prepare(
    "UPDATE therapists SET name = ?, specialty = ?, phone = ?, description = ?, updated_at = ? WHERE id = ?"
  ).run(
    input.name,
    input.specialty.length > 0 ? input.specialty : null,
    input.phone.length > 0 ? input.phone : null,
    input.description.length > 0 ? input.description : null,
    new Date().toISOString(),
    id
  )

  return listAllTherapists()
}

export async function setTherapistActive(id: number, active: boolean) {
  const db = getDatabase()

  db.prepare(
    "UPDATE therapists SET is_active = ?, updated_at = ? WHERE id = ?"
  ).run(active ? 1 : 0, new Date().toISOString(), id)

  return listAllTherapists()
}

export async function deleteTherapist(id: number) {
  const db = getDatabase()

  const referencing = db
    .prepare("SELECT COUNT(*) AS count FROM appointments WHERE therapist_id = ?")
    .get(id) as { count: number }

  if ((referencing?.count ?? 0) > 0) {
    throw new Error(
      "این متخصص در نوبت‌ها استفاده شده است؛ نمی‌توان او را حذف کرد. به‌جای حذف، او را غیرفعال کنید."
    )
  }

  db.prepare("DELETE FROM therapists WHERE id = ?").run(id)

  return listAllTherapists()
}

function normalizeCustomerQuery(value: string) {
  return toEnDigits(value)
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export async function listCustomers(limit = 20) {
  const db = getDatabase()

  return db
    .prepare(
      "SELECT id, full_name, phone, notes, referral, updated_at FROM customers WHERE deleted_at IS NULL ORDER BY updated_at DESC LIMIT ?"
    )
    .all(limit) as Customer[]
}

export async function listAllCustomers() {
  const db = getDatabase()

  return db
    .prepare(
      `SELECT customers.id,
              customers.full_name,
              customers.phone,
              customers.notes,
              customers.referral,
              customers.updated_at,
              COUNT(appointments.id) AS total_sessions,
              COALESCE(SUM(CASE WHEN appointments.status = 'completed' THEN 1 ELSE 0 END), 0) AS completed_sessions,
              MAX(appointments.start_at) AS last_session_at
       FROM customers
       LEFT JOIN appointments ON appointments.customer_id = customers.id
       WHERE customers.deleted_at IS NULL
       GROUP BY customers.id
       ORDER BY customers.updated_at DESC`
    )
    .all() as CustomerListRow[]
}

export async function updateCustomer(id: number, input: CustomerInput) {
  const db = getDatabase()
  const fullName = input.full_name.trim()
  const phone = toEnDigits(input.phone).trim()
  const referral = input.referral.trim()

  if (!fullName) {
    throw new Error("نام مشتری نمی‌تواند خالی باشد.")
  }

  if (phone && !/^09\d{9}$/.test(phone)) {
    throw new Error("شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد.")
  }

  if (phone) {
    const duplicate = db
      .prepare(
        "SELECT id FROM customers WHERE phone = ? AND id != ? AND deleted_at IS NULL LIMIT 1"
      )
      .get(phone, id) as { id: number } | undefined

    if (duplicate) {
      throw new Error("این شماره موبایل برای مشتری دیگری ثبت شده است.")
    }
  }

  db.prepare(
    "UPDATE customers SET full_name = ?, phone = ?, referral = ?, updated_at = ? WHERE id = ?"
  ).run(
    fullName,
    phone,
    referral.length > 0 ? referral : null,
    new Date().toISOString(),
    id
  )

  return listAllCustomers()
}

export async function searchCustomers(query: string, limit = 8) {
  const needle = normalizeCustomerQuery(query)

  if (needle.length === 0) {
    return listCustomers(limit)
  }

  const db = getDatabase()
  const like = `%${needle}%`

  return db
    .prepare(
      `SELECT id, full_name, phone, notes, referral, updated_at
       FROM customers
       WHERE deleted_at IS NULL
         AND (
           REPLACE(REPLACE(full_name, 'ي', 'ی'), 'ك', 'ک') LIKE ?
           OR REPLACE(phone, ' ', '') LIKE ?
         )
       ORDER BY
         CASE WHEN REPLACE(REPLACE(full_name, 'ي', 'ی'), 'ك', 'ک') = ? THEN 0 ELSE 1 END,
         updated_at DESC
       LIMIT ?`
    )
    .all(like, like.replace(/\s/g, ""), needle, limit) as Customer[]
}

function findBusyRanges(sessions: SessionRange[], excludeId?: number) {
  const db = getDatabase()
  const busy: SessionRange[] = []
  const statement = db.prepare(
    "SELECT COUNT(*) AS count FROM appointments WHERE status = 'scheduled' AND id != ? AND start_at < ? AND end_at > ?"
  )

  for (const session of sessions) {
    const row = statement.get(
      excludeId ?? -1,
      session.end_at,
      session.start_at
    ) as { count: number }

    if ((row?.count ?? 0) > 0) {
      busy.push(session)
    }
  }

  return busy
}

function resolveCustomerId(customer: NewBooking["customer"]) {
  const db = getDatabase()
  const fullName = customer.full_name
  const phone = customer.phone
  const referral = customer.referral.trim()

  const existing =
    phone.length > 0
      ? (db
          .prepare(
            "SELECT id FROM customers WHERE phone = ? AND deleted_at IS NULL LIMIT 1"
          )
          .get(phone) as { id: number } | undefined)
      : (db
          .prepare(
            "SELECT id FROM customers WHERE (phone = '' OR phone IS NULL) AND full_name = ? AND deleted_at IS NULL LIMIT 1"
          )
          .get(fullName) as { id: number } | undefined)

  if (existing) {
    db.prepare(
      "UPDATE customers SET full_name = ?, referral = COALESCE(NULLIF(?, ''), referral) WHERE id = ?"
    ).run(fullName, referral, existing.id)

    return existing.id
  }

  const result = db
    .prepare("INSERT INTO customers (full_name, phone, referral) VALUES (?, ?, ?)")
    .run(fullName, phone, referral.length > 0 ? referral : null)

  return Number(result.lastInsertRowid)
}

function replaceAppointmentServices(appointmentId: number, services: Service[]) {
  const db = getDatabase()

  db.prepare("DELETE FROM appointment_services WHERE appointment_id = ?").run(
    appointmentId
  )

  const insert = db.prepare(
    "INSERT OR IGNORE INTO appointment_services (appointment_id, service_id) VALUES (?, ?)"
  )

  for (const item of services) {
    insert.run(appointmentId, item.id)
  }
}

export async function createBooking(booking: NewBooking) {
  const db = getDatabase()
  const { services } = resolveServices(booking.service_ids)
  const price = booking.appointment.price

  if (!Number.isSafeInteger(price) || price < 0) {
    throw new Error("قیمت نوبت باید عددی صحیح و نامنفی باشد.")
  }

  const busy = findBusyRanges(booking.sessions)

  if (busy.length > 0) {
    throw new Error(
      `این وقت با نوبت دیگری تداخل دارد: ${busy
        .map((session) => session.preview)
        .join("، ")}`
    )
  }

  const create = db.transaction(() => {
    const customerId = resolveCustomerId(booking.customer)
    const slug = `${customerId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`

    const insert = db.prepare(
      "INSERT INTO appointments (customer_id, service_id, therapist_id, start_at, end_at, price, status, notes, slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )

    for (const session of booking.sessions) {
      const result = insert.run(
        customerId,
        services[0]?.id ?? null,
        booking.therapist_id,
        session.start_at,
        session.end_at,
        price,
        booking.appointment.status,
        booking.appointment.notes.length > 0
          ? booking.appointment.notes
          : null,
        slug
      )

      replaceAppointmentServices(Number(result.lastInsertRowid), services)
    }
  })

  create()

  return booking.sessions.length
}

const appointmentSelect = `SELECT appointments.id,
            appointments.slug,
            appointments.start_at,
            appointments.end_at,
            appointments.price,
            appointments.status,
            appointments.notes,
            appointments.therapist_id,
            customers.referral,
            customers.full_name,
            customers.phone,
            therapists.name AS therapist_name
     FROM appointments
     INNER JOIN customers ON customers.id = appointments.customer_id
     LEFT JOIN therapists ON therapists.id = appointments.therapist_id`

type AppointmentBaseRow = Omit<AppointmentRow, "service_ids" | "service_names">

function withServices(rows: AppointmentBaseRow[]) {
  if (rows.length === 0) {
    return [] as AppointmentRow[]
  }

  const db = getDatabase()
  const ids = rows.map((row) => row.id)
  const placeholders = ids.map(() => "?").join(", ")
  const links = db
    .prepare(
      `SELECT appointment_services.appointment_id AS appointment_id,
              appointment_services.service_id AS service_id,
              services.name AS name
       FROM appointment_services
       INNER JOIN services ON services.id = appointment_services.service_id
       WHERE appointment_services.appointment_id IN (${placeholders})
       ORDER BY appointment_services.appointment_id, appointment_services.service_id`
    )
    .all(...ids) as {
    appointment_id: number
    service_id: number
    name: string
  }[]

  const grouped = new Map<number, { id: number; name: string }[]>()

  for (const link of links) {
    const list = grouped.get(link.appointment_id) ?? []
    list.push({ id: link.service_id, name: link.name })
    grouped.set(link.appointment_id, list)
  }

  return rows.map((row) => {
    const services = grouped.get(row.id) ?? []

    return {
      ...row,
      service_ids: services.map((item) => item.id),
      service_names: services.map((item) => item.name),
    }
  })
}

export async function updateAppointment(id: number, input: AppointmentEdit) {
  const db = getDatabase()
  const { services } = resolveServices(input.service_ids)
  const price = input.price

  if (!Number.isSafeInteger(price) || price < 0) {
    throw new Error("قیمت نوبت باید عددی صحیح و نامنفی باشد.")
  }

  const busy = findBusyRanges(
    [
      {
        start_at: input.start_at,
        end_at: input.end_at,
        preview: "",
      },
    ],
    id
  )

  if (input.status === "scheduled" && busy.length > 0) {
    throw new Error("این بازه با نوبت دیگری تداخل دارد.")
  }

  const update = db.transaction(() => {
    db.prepare(
      "UPDATE appointments SET service_id = ?, therapist_id = ?, start_at = ?, end_at = ?, price = ?, status = ?, notes = ?, updated_at = ? WHERE id = ?"
    ).run(
      services[0]?.id ?? null,
      input.therapist_id,
      input.start_at,
      input.end_at,
      price,
      input.status,
      input.notes.length > 0 ? input.notes : null,
      new Date().toISOString(),
      id
    )

    replaceAppointmentServices(id, services)
  })

  update()
}

export async function listForRange(from: string, to: string) {
  const db = getDatabase()

  const rows = db
    .prepare(
      `${appointmentSelect}
       WHERE appointments.start_at >= ? AND appointments.start_at < ?
       ORDER BY appointments.start_at`
    )
    .all(from, to) as AppointmentBaseRow[]

  return withServices(rows)
}

export async function listBookingSessions(slug: string) {
  const db = getDatabase()

  const rows = db
    .prepare(
      `${appointmentSelect}
       WHERE appointments.slug = ?
       ORDER BY appointments.start_at, appointments.id`
    )
    .all(slug) as AppointmentBaseRow[]

  return withServices(rows)
}

export async function listCustomerAppointments(customerId: number) {
  const db = getDatabase()

  const rows = db
    .prepare(
      `${appointmentSelect}
       WHERE customers.id = ?
       ORDER BY appointments.start_at, appointments.id`
    )
    .all(customerId) as AppointmentBaseRow[]

  return withServices(rows)
}

export async function listAllAppointments(limit = 500) {
  const db = getDatabase()

  const rows = db
    .prepare(
      `${appointmentSelect}
       ORDER BY appointments.start_at DESC
       LIMIT ?`
    )
    .all(limit) as AppointmentBaseRow[]

  return withServices(rows)
}

export async function setAppointmentStatus(
  id: number,
  status: AppointmentStatus
) {
  const db = getDatabase()

  db.prepare(
    "UPDATE appointments SET status = ?, updated_at = ? WHERE id = ?"
  ).run(status, new Date().toISOString(), id)
}

export async function deleteAppointment(id: number) {
  const db = getDatabase()

  const remove = db.transaction(() => {
    db.prepare("DELETE FROM appointment_services WHERE appointment_id = ?").run(
      id
    )
    db.prepare("DELETE FROM appointments WHERE id = ?").run(id)
  })

  remove()
}

export async function completeDayAppointments(from: string, to: string) {
  const db = getDatabase()

  const result = db
    .prepare(
      "UPDATE appointments SET status = 'completed', updated_at = ? WHERE status = 'scheduled' AND start_at >= ? AND start_at < ?"
    )
    .run(new Date().toISOString(), from, to)

  return result.changes
}

export async function reopenDayAppointments(from: string, to: string) {
  const db = getDatabase()

  const result = db
    .prepare(
      "UPDATE appointments SET status = 'scheduled', updated_at = ? WHERE status = 'completed' AND start_at >= ? AND start_at < ?"
    )
    .run(new Date().toISOString(), from, to)

  return result.changes
}

export async function deleteCustomer(id: number) {
  const db = getDatabase()

  const remove = db.transaction(() => {
    const appointments = db
      .prepare("SELECT id FROM appointments WHERE customer_id = ?")
      .all(id) as { id: number }[]

    const removeLinks = db.prepare(
      "DELETE FROM appointment_services WHERE appointment_id = ?"
    )

    for (const appointment of appointments) {
      removeLinks.run(appointment.id)
    }

    db.prepare("DELETE FROM appointments WHERE customer_id = ?").run(id)
    db.prepare("DELETE FROM customers WHERE id = ?").run(id)
  })

  remove()

  return listAllCustomers()
}
