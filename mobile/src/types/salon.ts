import type { DocumentId, FirestoreTimestamp } from './common';

export interface DailyBusinessHours {
  isOpen: boolean;
  /** Local wall-clock time in 24-hour `HH:mm` format. */
  opensAt?: string;
  /** Local wall-clock time in 24-hour `HH:mm` format. */
  closesAt?: string;
}

export type DayOfWeek =
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type WeeklyBusinessHours = Record<DayOfWeek, DailyBusinessHours>;

export interface Salon {
  name: string;
  address: string;
  city: string;
  email: string;
  phone: string;
  description: string;
  ownerId: DocumentId;
  businessHours: WeeklyBusinessHours;

  /**
   * Deliberate aggregate duplication: rating and reviewCount are maintained
   * when reviews change so salon lists need one read per salon rather than
   * reading every review. This is a Firestore read-cost optimization.
   */
  averageRating: number;
  reviewCount: number;

  isFeatured: boolean;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}
