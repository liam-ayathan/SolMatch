import { DocumentReference, Timestamp } from "@firebase/firestore-types";

export type Commitment = {
  supplier: string;
  percentage: string;
  fulfilled?: boolean;
};

export type Campaign = {
  id: string; // document ID
  title: string;
  description: string;
  category: string;
  start: Timestamp;
  end: Timestamp;
  targetAmount: number;
  currentAmount: number;
  commitment: Commitment[];
  charity: DocumentReference;
};
