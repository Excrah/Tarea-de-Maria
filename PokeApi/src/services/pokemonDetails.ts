import type { PokemonType, DetailedPokemon } from '../types/pokemon';

export const fetchPokemonDetails = async (id: string): Promise<DetailedPokemon> => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  
  if (!response.ok) {
    throw new Error(`Error fetching ${id}`);
  }
  
  const data = await response.json();
  
  return {
    id,
    name: data.name,
    types: data.types as PokemonType[]
  };
};

export const getTypeColor = (typeName: string): string => {
  const colors: Record<string, string> = {
    normal: 'bg-yellow-200 text-yellow-800',
    fire: 'bg-red-200 text-red-800',
    water: 'bg-blue-200 text-blue-800',
    grass: 'bg-green-200 text-green-800',
    electric: 'bg-yellow-400 text-yellow-900',
    ice: 'bg-cyan-200 text-cyan-800',
    fighting: 'bg-orange-200 text-orange-800',
    poison: 'bg-purple-200 text-purple-800',
    ground: 'bg-amber-300 text-amber-900',
    flying: 'bg-indigo-200 text-indigo-800',
    psychic: 'bg-pink-200 text-pink-800',
    bug: 'bg-lime-200 text-lime-800',
    rock: 'bg-gray-400 text-gray-900',
    ghost: 'bg-violet-300 text-violet-900',
    dragon: 'bg-purple-400 text-purple-900',
    dark: 'bg-gray-700 text-gray-100',
    steel: 'bg-gray-300 text-gray-900',
    fairy: 'bg-pink-300 text-pink-900'
  };
  
  return colors[typeName as keyof typeof colors] || 'bg-gray-200 text-gray-800';
};

