// contexts/HerdContext.tsx (COMPLETO E CORRIGIDO)

// 1. Importação do hook em vez do objeto
import { useHerdRepository } from '@/repositories/HerdRepository';
import { Animal, AnimalFilter, HealthEvent, User } from '@/types/models';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const [HerdProvider, useHerd] = createContextHook(() => {
  // 2. Repositório injetado via hook
  const herdRepository = useHerdRepository();

  const [user, setUser] = useState<User | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<AnimalFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 3. 'herdRepository' adicionado às dependências dos callbacks
  const loadUser = useCallback(async () => {
    try {
      const currentUser = await herdRepository.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }, [herdRepository]);

  const loadAnimals = useCallback(async () => {
    try {
      setIsLoading(true);
      const allAnimals = await herdRepository.getAllAnimals();
      setAnimals(allAnimals);
    } catch (error) {
      console.error('Error loading animals:', error);
    } finally {
      setIsLoading(false);
    }
  }, [herdRepository]);

  useEffect(() => {
    loadUser();
    loadAnimals();
  }, [loadUser, loadAnimals]);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    try {
      const newUser = await herdRepository.registerUser(fullName, email, password);
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }, [herdRepository]);

  const logout = useCallback(async () => {
    try {
      await herdRepository.logout();
      setUser(null);
      setAnimals([]);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }, [herdRepository]);

  const addAnimal = useCallback(async (animal: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newAnimal = await herdRepository.addAnimal(animal);
      setAnimals(prev => [...prev, newAnimal]);
      return newAnimal;
    } catch (error) {
      console.error('Error adding animal:', error);
      throw error;
    }
  }, [herdRepository]);

  const updateAnimal = useCallback(async (id: string, updates: Partial<Animal>) => {
    try {
      const updated = await herdRepository.updateAnimal(id, updates);
      setAnimals(prev => prev.map(a => a.id === id ? updated : a));
      return updated;
    } catch (error) {
      console.error('Error updating animal:', error);
      throw error;
    }
  }, [herdRepository]);

  const deleteAnimal = useCallback(async (id: string) => {
    try {
      await herdRepository.deleteAnimal(id);
      setAnimals(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting animal:', error);
      throw error;
    }
  }, [herdRepository]);

  const getAnimalById = useCallback((id: string): Animal | undefined => {
    return animals.find(a => a.id === id);
  }, [animals]);

  const addHealthEvent = useCallback(async (event: Omit<HealthEvent, 'id' | 'createdAt'>) => {
    try {
      return await herdRepository.addHealthEvent(event);
    } catch (error) {
      console.error('Error adding health event:', error);
      throw error;
    }
  }, [herdRepository]);

  const getHealthEvents = useCallback(async (animalId: string): Promise<HealthEvent[]> => {
    try {
      return await herdRepository.getHealthEvents(animalId);
    } catch (error) {
      console.error('Error getting health events:', error);
      return [];
    }
  }, [herdRepository]);

  const getAllHealthEvents = useCallback(async (): Promise<HealthEvent[]> => {
    try {
      return await herdRepository.getAllHealthEvents();
    } catch (error) {
      console.error('Error getting all health events:', error);
      return [];
    }
  }, [herdRepository]);

  const getDescendants = useCallback(async (parentId: string): Promise<Animal[]> => {
    try {
      return await herdRepository.getDescendants(parentId);
    } catch (error) {
      console.error('Error getting descendants:', error);
      return [];
    }
  }, [herdRepository]);

  const addDescendant = useCallback(async (parentId: string, childId: string, relationship: 'mother' | 'father') => {
    try {
      return await herdRepository.addDescendant(parentId, childId, relationship);
    } catch (error) {
      console.error('Error adding descendant:', error);
      throw error;
    }
  }, [herdRepository]);

  // 4. 'useMemo' atualizado com todos os callbacks que dependem do 'herdRepository'
  return useMemo(() => ({
    user,
    animals,
    isLoading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    register,
    logout,
    addAnimal,
    updateAnimal,
    deleteAnimal,
    getAnimalById,
    addHealthEvent,
    getHealthEvents,
    getAllHealthEvents,
    getDescendants,
    addDescendant,
    refreshAnimals: loadAnimals,
  }), [
    user,
    animals,
    isLoading,
    filter,
    searchQuery,
    register,
    logout,
    addAnimal,
    updateAnimal,
    deleteAnimal,
    getAnimalById,
    addHealthEvent,
    getHealthEvents,
    getAllHealthEvents,
    getDescendants,
    addDescendant,
    loadAnimals,
  ]);
});

export function useFilteredAnimals() {
  const { animals, filter, searchQuery } = useHerd();
  // 5. Injete o repositório aqui também
  const herdRepository = useHerdRepository();
  const [descendants, setDescendants] = useState<string[]>([]);

  useEffect(() => {
    if (filter === 'calf') {
      const loadDescendantIds = async () => {
        try {
          const descendantAnimals = await Promise.all(
            animals.map(async (animal) => {
              // 6. Use o repositório injetado
              const children = await herdRepository.getDescendants(animal.id);
              return children.map(c => c.id);
            })
          );
          const flatDescendantIds = descendantAnimals.flat();
          setDescendants(flatDescendantIds);
        } catch (error) {
          console.error('Error loading descendants:', error);
        }
      };
      loadDescendantIds();
    }
  }, [filter, animals, herdRepository]); // 7. Adicione 'herdRepository'

  return animals.filter(animal => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'cow' && (animal.type === 'cow' || animal.type === 'bull')) ||
      (filter === 'calf' && (animal.type === 'calf' || descendants.includes(animal.id))) ||
      (filter === 'for_sale' && animal.status === 'for_sale');

    const matchesSearch = 
      searchQuery === '' ||
      animal.tagId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;

    return matchesFilter && matchesSearch;
  });
}