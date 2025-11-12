// repositories/HerdRepository.ts (COMPLETO E CORRIGIDO)

import { Animal, HealthEvent, Descendant, User } from '@/types/models';
import { StorageService } from '@/services/storage';
import React, { createContext, useContext, useMemo } from 'react';

// 1. A classe do Repositório é mantida, mas não é exportada diretamente
class HerdRepository {
  async registerUser(fullName: string, email: string, password: string): Promise<User> {
    const user: User = {
      id: Date.now().toString(),
      fullName,
      email,
      createdAt: new Date().toISOString(),
    };
    await StorageService.setUser(user);
    return user;
  }

  async getCurrentUser(): Promise<User | null> {
    return await StorageService.getUser();
  }

  async logout(): Promise<void> {
    await StorageService.clearUser();
  }

  async getAllAnimals(): Promise<Animal[]> {
    return await StorageService.getAnimals();
  }

  async getAnimalById(id: string): Promise<Animal | undefined> {
    const animals = await StorageService.getAnimals();
    return animals.find(a => a.id === id);
  }

  async addAnimal(animal: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Animal> {
    const animals = await StorageService.getAnimals();
    const newAnimal: Animal = {
      ...animal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    animals.push(newAnimal);
    await StorageService.setAnimals(animals);
    return newAnimal;
  }

  async updateAnimal(id: string, updates: Partial<Animal>): Promise<Animal> {
    const animals = await StorageService.getAnimals();
    const index = animals.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Animal not found');
    
    animals[index] = {
      ...animals[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await StorageService.setAnimals(animals);
    return animals[index];
  }

  async deleteAnimal(id: string): Promise<void> {
    const animals = await StorageService.getAnimals();
    const filtered = animals.filter(a => a.id !== id);
    await StorageService.setAnimals(filtered);
  }

  async getHealthEvents(animalId: string): Promise<HealthEvent[]> {
    const events = await StorageService.getHealthEvents();
    return events.filter(e => e.animalId === animalId);
  }

  async getAllHealthEvents(): Promise<HealthEvent[]> {
    return await StorageService.getHealthEvents();
  }

  async addHealthEvent(event: Omit<HealthEvent, 'id' | 'createdAt'>): Promise<HealthEvent> {
    const events = await StorageService.getHealthEvents();
    const newEvent: HealthEvent = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    events.push(newEvent);
    await StorageService.setHealthEvents(events);
    return newEvent;
  }

  async updateHealthEvent(id: string, updates: Partial<HealthEvent>): Promise<HealthEvent> {
    const events = await StorageService.getHealthEvents();
    const index = events.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Health event not found');
    
    events[index] = { ...events[index], ...updates };
    await StorageService.setHealthEvents(events);
    return events[index];
  }

  async deleteHealthEvent(id: string): Promise<void> {
    const events = await StorageService.getHealthEvents();
    const filtered = events.filter(e => e.id !== id);
    await StorageService.setHealthEvents(filtered);
  }

  async getDescendants(parentId: string): Promise<Animal[]> {
    const descendants = await StorageService.getDescendants();
    const animals = await StorageService.getAnimals();
    
    const childIds = descendants
      .filter(d => d.parentId === parentId)
      .map(d => d.childId);
    
    return animals.filter(a => childIds.includes(a.id));
  }

  async addDescendant(parentId: string, childId: string, relationship: 'mother' | 'father'): Promise<Descendant> {
    const descendants = await StorageService.getDescendants();
    const newDescendant: Descendant = {
      id: Date.now().toString(),
      parentId,
      childId,
      relationship,
      createdAt: new Date().toISOString(),
    };
    descendants.push(newDescendant);
    await StorageService.setDescendants(descendants);
    return newDescendant;
  }
}

// 2. Crie o Contexto
const HerdRepositoryContext = createContext<HerdRepository | null>(null);

// 3. Crie o Provider que instancia a classe UMA VEZ
export function HerdRepositoryProvider({ children }: { children: React.ReactNode }) {
  // A instância é criada aqui, dentro do React, e memoizada
  const repository = useMemo(() => new HerdRepository(), []);

  return (
    <HerdRepositoryContext.Provider value={repository}>
      {children}
    </HerdRepositoryContext.Provider>
  );
}

// 4. Crie o Hook para acessar o repositório
export function useHerdRepository() {
  const context = useContext(HerdRepositoryContext);
  if (!context) {
    throw new Error("useHerdRepository must be used within a HerdRepositoryProvider");
  }
  return context;
}

// 5. A linha problemática foi removida
// export const herdRepository = new HerdRepository(); // <- REMOVIDA