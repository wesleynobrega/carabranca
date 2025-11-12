import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Animal, HealthEvent, Descendant } from '@/types/models';

const STORAGE_KEYS = {
  USER: '@happyherd:user',
  ANIMALS: '@happyherd:animals',
  HEALTH_EVENTS: '@happyherd:health_events',
  DESCENDANTS: '@happyherd:descendants',
} as const;

export class StorageService {
  static async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  static async setUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user:', error);
      throw error;
    }
  }

  static async clearUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Error clearing user:', error);
      throw error;
    }
  }

  static async getAnimals(): Promise<Animal[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ANIMALS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting animals:', error);
      return [];
    }
  }

  static async setAnimals(animals: Animal[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ANIMALS, JSON.stringify(animals));
    } catch (error) {
      console.error('Error setting animals:', error);
      throw error;
    }
  }

  static async getHealthEvents(): Promise<HealthEvent[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HEALTH_EVENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting health events:', error);
      return [];
    }
  }

  static async setHealthEvents(events: HealthEvent[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HEALTH_EVENTS, JSON.stringify(events));
    } catch (error) {
      console.error('Error setting health events:', error);
      throw error;
    }
  }

  static async getDescendants(): Promise<Descendant[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DESCENDANTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting descendants:', error);
      return [];
    }
  }

  static async setDescendants(descendants: Descendant[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DESCENDANTS, JSON.stringify(descendants));
    } catch (error) {
      console.error('Error setting descendants:', error);
      throw error;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER,
        STORAGE_KEYS.ANIMALS,
        STORAGE_KEYS.HEALTH_EVENTS,
        STORAGE_KEYS.DESCENDANTS,
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}
