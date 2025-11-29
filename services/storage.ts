import AsyncStorage from '@react-native-async-storage/async-storage';
// 1. Remova os tipos não utilizados
// import { User, Animal, HealthEvent, Descendant } from '../../../types/models.js';

const STORAGE_KEYS = {
  USER_TOKEN: '@happyherd:user_token', 
  USER_LOCALE: '@happyherd:locale',
  // 2. Remova as chaves antigas
  // ANIMALS: '@happyherd:animals',
  // HEALTH_EVENTS: '@happyherd:health_events',
  // DESCENDANTS: '@happyherd:descendants',
} as const;

export class StorageService {
  
  // --- Funções de Token (Corretas) ---
  static async getToken(): Promise<string | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      return data ? data : null; 
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  static async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
    } catch (error) {
      console.error('Error setting token:', error);
      throw error;
    }
  }

  static async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    } catch (error) {
      console.error('Error clearing token:', error);
      throw error;
    }
  }

  // --- Funções de Idioma (Corretas) ---
  static async getLocale(): Promise<string | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_LOCALE);
      return data ? data : null;
    } catch (error) {
      console.error('Error getting locale:', error);
      return null;
    }
  }

  static async setLocale(locale: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_LOCALE, locale);
    } catch (error) {
      console.error('Error setting locale:', error);
      throw error;
    }
  }

  // 3. REMOVA TODAS AS OUTRAS FUNÇÕES
  // (getAnimals, setAnimals, getHealthEvents, setHealthEvents, etc.)

  // 4. ATUALIZE O clearAllData
  static async clearAllData(): Promise<void> {
    try {
      // Limpa apenas o token e o idioma
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.USER_LOCALE,
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}