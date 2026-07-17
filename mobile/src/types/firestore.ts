import type { Appointment } from './appointment';
import type { Offer } from './offer';
import type { Review } from './review';
import type { Salon } from './salon';
import type { Service } from './service';
import type { AppUser } from './user';

/** Centralized names prevent string drift across queries and security rules. */
export const COLLECTIONS = {
  users: 'users',
  salons: 'salons',
  services: 'services',
  appointments: 'appointments',
  reviews: 'reviews',
  offers: 'offers',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/** Compile-time map from each collection name to its stored document shape. */
export interface FirestoreCollectionMap {
  users: AppUser;
  salons: Salon;
  services: Service;
  appointments: Appointment;
  reviews: Review;
  offers: Offer;
}
