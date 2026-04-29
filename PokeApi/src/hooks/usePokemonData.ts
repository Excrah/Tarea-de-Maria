import { useEffect, useState, useCallback } from 'react';
import { fetchPokemonList } from '../services/pokeApi';
import type { Pokemon } from '../types/pokemon';

export const usePokemonData = () => {
  const [database, setDatabase] = useState<Pokemon[]>([]);
  const [displayList, setDisplayList] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchPokemonList();
        setDatabase(data);
        setDisplayList(data);
        setError(null);
      } catch (err) {
        setError('Error cargando Pokémon. Revisa conexión.');
        console.error("Error API:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSearch = useCallback((query: string) => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) {
      setDisplayList(database);
      return;
    }
    const filtered = database.filter(poke => 
      poke.name.toLowerCase().includes(normalized)
    );
    setDisplayList(filtered);
  }, [database]);

  return {
    database,
    displayList,
    isLoading,
    error,
    search: handleSearch
  };
};

