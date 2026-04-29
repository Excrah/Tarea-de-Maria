import { useState, useMemo, useCallback } from 'react';
import type { Pokemon } from '../types/pokemon';

const ALL_TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice', 
  'fighting', 'poison', 'ground', 'flying', 'psychic', 
  'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
] as const;

type TypeName = typeof ALL_TYPES[number];

interface Props {
  pokemonList: Pokemon[];
}

export const usePokemonFilters = (pokemonList: Pokemon[]) => {
  const [selectedTypes, setSelectedTypes] = useState<TypeName[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredList = useMemo(() => {
    let list = pokemonList;

    // Search filter
    if (searchQuery.trim()) {
      const normalizedQuery = searchQuery.toLowerCase().trim();
      list = list.filter(p => p.name.toLowerCase().includes(normalizedQuery));
    }

    // Type filter (check if pokemon.types exists from details)
    if (selectedTypes.length > 0) {
      list = list.filter(p => {
        if (!p.types || p.types.length === 0) return false;
        return selectedTypes.some(selectedType => 
          p.types.some((t: any) => t.type.name === selectedType)
        );
      });
    }

    return list;
  }, [pokemonList, selectedTypes, searchQuery]);

  const setTypesFilter = useCallback((types: TypeName[]) => {
    setSelectedTypes(types);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedTypes([]);
    setSearchQuery('');
  }, []);

  const activeFilters = selectedTypes.length + (searchQuery.trim() ? 1 : 0);

  return {
    filteredList,
    selectedTypes,
    setTypesFilter,
    searchQuery,
    setSearchQuery,
    clearFilters,
    activeFilters,
    allTypes: ALL_TYPES,
    hasFilters: activeFilters > 0
  };
};

