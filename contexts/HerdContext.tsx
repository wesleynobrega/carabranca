'use client';

import { setAppLocale } from '@/lib/i18n';
import { trpc } from '@/lib/trpc';
import { StorageService } from '@/services/storage';
import { useQueryClient } from '@tanstack/react-query';
import * as Localization from 'expo-localization';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Animal, AnimalFilter, User } from '../../../types/models.js';

// --- Interface e Contexto (Sem alterações) ---
interface HerdContextType {
  user: User | null;
  animals: Animal[];
  isLoading: boolean;
  locale: string; 
  changeLocale: (newLocale: string) => Promise<void>; 
  filter: AnimalFilter;
  searchQuery: string;
  register: (fullName: string, email: string, password: string) => Promise<User | undefined>;
  login: (email: string, password: string) => Promise<User | undefined>;
  logout: () => Promise<void>;
  addAnimal: (animal: Omit<Animal, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Animal | undefined>;
  updateAnimal: (id: string, updates: Partial<Animal>) => Promise<Animal | undefined>;
  deleteAnimal: (id: string) => Promise<void>;
  getAnimalById: (id: string) => Animal | undefined;
  refreshAnimals: () => Promise<any>;
  setFilter: (filter: AnimalFilter) => void;
  setSearchQuery: (query: string) => void;
}
const HerdContext = createContext<HerdContextType | undefined>(undefined);

// --- Componente Provedor (Corrigido) ---
export function HerdProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient(); 
  const DEBUG_DISABLE_AUTO_QUERIES = false;

  // --- Estados ---
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [locale, setLocale] = useState<string>('pt-BR'); 
  const [filter, setFilter] = useState<AnimalFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false); 
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // --- Setters Seguros ---
  const setUserSafe = useCallback((next: User | null) => {
    setUser((prev) => (prev === next || (prev && next && prev.id === next.id) ? prev : next));
  }, []);
  const setTokenSafe = useCallback((next: string | null) => {
    setToken((prev) => (prev === next ? prev : next));
  }, []);

  // --- Mutações tRPC ---
  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();
  const createAnimalMutation = trpc.animal.create.useMutation();
  const updateAnimalMutation = trpc.animal.update.useMutation();
  const deleteAnimalMutation = trpc.animal.delete.useMutation();

  // trpc utils para invalidar queries de forma segura
  const trpcUtils = trpc.useContext();

  // --- Queries tRPC ---
  const { data: animalsFromQuery = [], refetch: refetchAnimals, isLoading: isLoadingAnimals } =
    trpc.animal.list.useQuery(undefined, { enabled: !DEBUG_DISABLE_AUTO_QUERIES && !!user && !!token });

  const { data: userFromToken, error: meError, isLoading: isLoadingSession } =
    trpc.auth.me.useQuery(undefined, { enabled: !DEBUG_DISABLE_AUTO_QUERIES && !!token && !isBootstrapping, retry: false });

  // --- Effects (Corrigidos) ---
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await StorageService.getToken();
        setTokenSafe(storedToken);
        const storedLocale = await StorageService.getLocale();
        if (storedLocale) {
          setLocale(setAppLocale(storedLocale));
        } else {
          const deviceLocale = Localization.getLocales()[0]?.languageTag || 'pt-BR';
          setLocale(setAppLocale(deviceLocale));
        }
      } finally {
        setIsBootstrapping(false);
      }
    })();
  }, [setTokenSafe]);

  useEffect(() => {
    if (userFromToken) {
      setUserSafe(userFromToken as unknown as User);
    } else if (meError) {
      setUserSafe(null);
      StorageService.clearToken().catch(() => {});
      setTokenSafe(null);
    }
  }, [userFromToken, meError, setUserSafe, setTokenSafe]);

  // --- Estado de Loading ---
  const isLoading = useMemo(() => isBootstrapping || isLoggingIn || isLoadingSession || (!!user && isLoadingAnimals),
    [isBootstrapping, isLoggingIn, isLoadingSession, user, isLoadingAnimals]);

  // stable animals ref
  const animalsRef = useRef<Animal[]>(animalsFromQuery);
  useEffect(() => { animalsRef.current = animalsFromQuery; }, [animalsFromQuery]);
  const getAnimalById = useCallback((id: string) => animalsRef.current.find(a => a.id === id), [animalsRef]);

  // --- AÇÕES (CORRIGIDAS) ---

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    const resp = await registerMutation.mutateAsync({ fullName, email, password });
    const newUser = resp?.user as unknown as User | undefined;
    const tok = resp?.token;
    if (tok) {
      await StorageService.setToken(tok);
      setTokenSafe(tok);
    }
    if (newUser) setUserSafe(newUser);
    return newUser;
  }, [registerMutation, setTokenSafe, setUserSafe]);

  const login = useCallback(async (email: string, password: string) => {
    console.log('[HerdContext] login called', { email });
    if (isLoggingIn) return undefined;
    setIsLoggingIn(true);
    try {
      const resp = await loginMutation.mutateAsync({ email, password });
      const newUser = resp?.user as unknown as User | undefined;
      const tok = resp?.token;
      if (tok) {
        await StorageService.setToken(tok);
        setTokenSafe(tok);
      }
      if (newUser) setUserSafe(newUser);
      return newUser;
    } finally {
      setIsLoggingIn(false);
    }
  }, [loginMutation, setTokenSafe, setUserSafe, isLoggingIn]); // isLoggingIn PODE ficar aqui

  const logout = useCallback(async () => {
    await StorageService.clearAllData().catch(() => {});
    setTokenSafe(null);
    setUserSafe(null);
    setLocale(setAppLocale('pt-BR'));
    try { 
      await queryClient.cancelQueries(); 
    } catch (e) { /* ignore */ }
  }, [setTokenSafe, setUserSafe, queryClient]); // queryClient PODE ficar, ele é estável

  
  // 
  // =================================================================
  // AQUI ESTÁ A CORREÇÃO DO LOOP
  // =================================================================
  //

  const addAnimal = useCallback(async (animal: Omit<Animal, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      const newAnimal = await createAnimalMutation.mutateAsync(animal as any);
      await trpcUtils.animal.list.invalidate();
      return newAnimal as Animal;
    } catch (error) {
      console.error('Error adding animal:', error);
      throw error;
    }
  }, [createAnimalMutation, trpcUtils]); 

  const updateAnimal = useCallback(async (id: string, updates: Partial<Animal>) => {
    try {
      const updatedAnimal = await updateAnimalMutation.mutateAsync({ id, updates });
      await trpcUtils.animal.list.invalidate();
      await trpcUtils.animal.get.invalidate({ id });
      return updatedAnimal as Animal;
    } catch (error) {
      console.error('Error updating animal:', error);
      throw error;
    }
  }, [updateAnimalMutation, trpcUtils]); 

  const deleteAnimal = useCallback(async (id: string) => {
    try {
      await deleteAnimalMutation.mutateAsync({ id });
      await trpcUtils.animal.list.invalidate();
    } catch (error) {
      console.error('Error deleting animal:', error);
      throw error;
    }
  }, [deleteAnimalMutation, trpcUtils]); 

  const changeLocale = useCallback(async (newLocale: string) => {
    const actualLocale = setAppLocale(newLocale);
    setLocale(actualLocale);
    await StorageService.setLocale(actualLocale);
  }, []);
  
  // --- Valor do Contexto (Corrigido) ---
  const value = useMemo<HerdContextType>(() => ({
    user,
    animals: animalsFromQuery,
    isLoading,
    locale,
    changeLocale,
    filter,
    searchQuery,
    register,
    login,
    logout,
    addAnimal,
    updateAnimal,
    deleteAnimal,
    getAnimalById,
    refreshAnimals: refetchAnimals,
    setFilter,
    setSearchQuery,
  }), [
    user, animalsFromQuery, isLoading, locale, filter, searchQuery,
    register, login, logout, addAnimal, updateAnimal, deleteAnimal, 
    getAnimalById, refetchAnimals, changeLocale
  ]);

  if (isBootstrapping) return null;

  return <HerdContext.Provider value={value}>{children}</HerdContext.Provider>;
}

// --- Hooks de Consumo (Corrigidos) ---
export function useHerd(): HerdContextType {
  const ctx = useContext(HerdContext);
  if (!ctx) throw new Error('useHerd must be used within HerdProvider');
  return ctx;
}

export function useFilteredAnimals() {
  const { user, animals, filter, searchQuery } = useHerd();
  const { data: descendantIds = [] } = trpc.descendant.listAll.useQuery(undefined, { enabled: !!user && filter === 'calf' });
  return useMemo(() => {
    return animals.filter(animal => {
      const matchesFilter = () => {
        if (filter === 'all') return true;
        if (filter === 'cow') return animal.type === 'cow' || animal.type === 'bull';
        if (filter === 'for_sale') return animal.status === 'for_sale';
        if (filter === 'calf') return animal.type === 'calf' || descendantIds.includes(animal.id);
        return false;
      };
      const lowerQuery = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        (animal.tagId && animal.tagId.toLowerCase().includes(lowerQuery)) || 
        (animal.name && animal.name.toLowerCase().includes(lowerQuery));
      return matchesFilter() && matchesSearch;
    });
  }, [animals, filter, searchQuery, descendantIds]);
}