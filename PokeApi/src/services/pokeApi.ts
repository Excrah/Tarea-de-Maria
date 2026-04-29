

import type { Pokemon, DetailedPokemon } from "../types/pokemon";
import { fetchPokemonDetails } from "./pokemonDetails";

export const fetchPokemonList = async (limit: number = 200): Promise<DetailedPokemon[]> => {  // More Pokémon
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
  
  if (!response.ok) {
    throw new Error("Error al conectar con PokeAPI");
  }
  
  const data = await response.json();
  
  // Batch fetch details with types
  const pokemonPromises = data.results.map(async (item: { name: string; url: string }) => {
    const urlSegments = item.url.split('/').filter(Boolean);
    const id = urlSegments[urlSegments.length - 1];
    return fetchPokemonDetails(id);
  });

  const pokemonList = await Promise.all(pokemonPromises);
  return pokemonList;
};
