import type { DocumentId, FirestoreTimestamp } from './common';

export type UserRole = 'customer' | 'salonStaff' | 'admin';

interface BaseUser {
  /** Firebase Auth UID is also the `users/{uid}` document ID. */
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

/**
 * Mongoose `User` and `Customer` are merged into one Firestore document.
 *
 * Firestore charges per document read, so keeping identity and the small
 * customer profile together avoids an extra Customer lookup on every session.
 * Password hashes, verification/reset tokens, and OAuth IDs are intentionally
 * absent because Firebase Authentication owns those credentials.
 */
export interface CustomerUser extends BaseUser {
  role: 'customer';
  preferredStaffId?: DocumentId;
  lastActiveAt: FirestoreTimestamp;
}

/**
 * The old Barber profile is folded into the staff user's document.
 *
 * `salonId` is duplicated here so security rules and staff appointment queries
 * can authorize by salon without joining through a separate Barber document.
 */
export interface SalonStaffUser extends BaseUser {
  role: 'salonStaff';
  salonId: DocumentId;
  specialty: string;
  experienceYears: number;
  staffRating: number;
  staffReviewCount: number;
  isSalonOwner: boolean;
}

export interface AdminUser extends BaseUser {
  role: 'admin';
}

/** Discriminated union for documents stored in the `users` collection. */
export type AppUser = CustomerUser | SalonStaffUser | AdminUser;
