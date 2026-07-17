import type { DocumentId, FirestoreTimestamp } from './common';

export type SentimentLabel = 'positive' | 'negative' | 'neutral';

export interface Review {
  customerId: DocumentId;
  salonId: DocumentId;
  appointmentId: DocumentId;
  staffId?: DocumentId;

  /**
   * The customer's display name is copied at write time so a salon review feed
   * is a single indexed query with no per-review user reads.
   */
  customerName: string;

  /** Integer from 1 through 5; enforced by UI and Firestore Security Rules. */
  rating: number;
  reviewText: string;

  /**
   * Written asynchronously by the review Cloud Function in Step 6.
   * Optional while processing; clients may display a neutral pending state.
   */
  sentimentLabel?: SentimentLabel;

  /** True only when appointmentId points to the customer's completed booking. */
  isVerified: boolean;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}
