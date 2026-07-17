import type { DocumentId, FirestoreTimestamp } from './common';

export type ServiceCategory =
  'Haircut' | 'Hair Color' | 'Hair Styling' | 'Beard Trim' | 'Facial' | 'Massage' | 'Other';

/** Document stored in the top-level `services` collection. */
export interface Service {
  /**
   * Services remain top-level and carry salonId instead of being embedded in a
   * salon. This supports independent CRUD, indexing, and collection queries
   * while still allowing `where('salonId', '==', salonId)` detail queries.
   */
  salonId: DocumentId;
  name: string;
  description: string;
  category: ServiceCategory;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}
