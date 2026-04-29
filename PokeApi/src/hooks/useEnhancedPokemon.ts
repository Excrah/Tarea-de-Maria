import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchPokemonList } from '../services/pokeApi';
import type { Pokemon } from '../types/pokemon';

const ALL_TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice', 
  'fighting', 'poison', 'ground', 'flying', 'psychic', 
  'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
] as const;

type TypeName = typeof ALL_TYPES[number];

export const useEnhancedPokemon = () => {
  const [database, setDatabase] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<TypeName[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch initial list
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchPokemonList();
        setDatabase(data);
        setError(null);
      } catch (err) {
        setError('Error cargando Pokémon');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredList = useMemo(() => {
    let list = database;

    // Search
    if (searchQuery.trim()) {
      const normalized = searchQuery.toLowerCase().trim();
      list = list.filter(p => p.name.toLowerCase().includes(normalized));
    }

    // Types (when details loaded)
    if (selectedTypes.length > 0) {
      list = list.filter(p => 
        p.types?.some((t: any) => selectedTypes.includes(t.type.name as TypeName))
      );
    }

    return list;
  }, [database, searchQuery, selectedTypes]);

  const setTypesFilter = useCallback((types: TypeName[]) => {
    setSelectedTypes(types);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedTypes([]);
    setSearchQuery('');
  }, []);

  const activeFiltersCount = selectedTypes.length + (searchQuery.trim() ? 1 : 0);

  return {
    pokemonList: filteredList,
    isLoading,
    error,
    selectedTypes,
    setTypesFilter,
    searchQuery,
    setSearchQuery,
    clearAllFilters,
    activeFiltersCount,
    allTypes: ALL_TYPES,
    hasActiveFilters: activeFiltersCount > 0
  };
};

