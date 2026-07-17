import type { DocumentId, FirestoreTimestamp } from './common';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export type PaymentStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

export interface Appointment {
  customerId: DocumentId;
  salonId: DocumentId;
  staffId: DocumentId;
  serviceId: DocumentId;

  /**
   * Display snapshots intentionally duplicate mutable names and service data.
   * Appointment history must preserve what was booked, and list screens avoid
   * four extra document reads. IDs remain the authoritative relationships.
   */
  customerName: string;
  salonName: string;
  staffName: string;
  serviceName: string;
  servicePrice: number;
  serviceDurationMinutes: number;

  /**
   * The Mongoose ScheduleSlot reference is replaced by a concrete interval.
   * Availability is checked transactionally against appointments for the same
   * salon/staff and time range, preventing two sources of booking truth.
   */
  startsAt: FirestoreTimestamp;
  endsAt: FirestoreTimestamp;

  paymentStatus: PaymentStatus;
  status: AppointmentStatus;
  notes?: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}
