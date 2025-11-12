export interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface Animal {
  id: string;
  userId: string;
  tagId: string;
  name?: string;
  type: 'cow' | 'calf' | 'bull' | 'heifer' | 'steer';
  gender: 'M' | 'F';
  dateOfBirth: string;
  breed?: string;
  color?: string;
  weight?: number;
  status: 'active' | 'sold' | 'deceased' | 'for_sale';
  imageUri?: string;
  motherId?: string;
  fatherId?: string;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthEvent {
  id: string;
  animalId: string;
  eventType: 'vaccination' | 'treatment' | 'checkup' | 'injury' | 'other';
  eventName: string;
  date: string;
  time?: string;
  description?: string;
  veterinarian?: string;
  cost?: number;
  createdAt: string;
}

export interface Descendant {
  id: string;
  parentId: string;
  childId: string;
  relationship: 'mother' | 'father';
  createdAt: string;
}

export type AnimalFilter = 'all' | 'cow' | 'calf' | 'for_sale';
