import type { Timestamp } from 'firebase/firestore';

/** Firestore document ID, represented as a string in application code. */
export type DocumentId = string;

/** Firestore stores dates as timezone-safe Timestamp values, not JS Date strings. */
export type FirestoreTimestamp = Timestamp;

/** Adds the document ID returned by a Firestore snapshot to a stored document. */
export type WithId<T> = T & { id: DocumentId };
