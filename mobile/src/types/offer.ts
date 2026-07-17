import type { DocumentId, FirestoreTimestamp } from './common';

/** Document stored in `offers`; retained for the salon-side CRUD flow. */
export interface Offer {
  salonId: DocumentId;
  name: string;
  description?: string;
  discountPercentage: number;

  /**
   * Service IDs stay as lightweight references rather than embedded service
   * copies because offers are edited independently and current service details
   * should be shown. Firestore supports array membership queries when needed.
   */
  serviceIds: DocumentId[];

  startsAt: FirestoreTimestamp;
  endsAt: FirestoreTimestamp;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}
