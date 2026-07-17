import type { DocumentId, FirestoreTimestamp } from './common';

/**
 * Derived client view model replacing the persisted Mongoose ScheduleSlot.
 *
 * Firestore does not store a separate slot document with `isBooked` and an
 * appointment reference because that duplicates appointment state and can
 * drift. The booking flow builds these slots from salon business hours and
 * service duration, then removes intervals occupied by active appointments.
 */
export interface AvailableSlot {
  salonId: DocumentId;
  staffId: DocumentId;
  startsAt: FirestoreTimestamp;
  endsAt: FirestoreTimestamp;
}
