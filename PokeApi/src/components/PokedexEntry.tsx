import { useState, useEffect } from 'react';
import type { Pokemon } from '../types/pokemon';
import { fetchPokemonDetails, getTypeColor } from '../services/pokemonDetails';

interface Props {
  pokemon: Pokemon;
}

export default function PokedexEntry({ pokemon }: Props) {
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        const details = await fetchPokemonDetails(pokemon.id);
        setTypes(details.types.map((t: any) => t.type.name));
      } catch (err) {
        console.error(`Error loading types for ${pokemon.name}:`, err);
        setTypes([]);
      } finally {
        setLoading(false);
      }
    };

    // Solo fetch si no tiene types (initial data lacks them)
    if (!pokemon.types?.length) {
      loadDetails();
    } else {
      setTypes(pokemon.types.map((t: any) => t.type.name));
      setLoading(false);
    }
  }, [pokemon.id, pokemon.types]);

  return (
    <article className="group relative bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-white/40 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-in-out cursor-pointer">
      <div className="absolute top-4 right-4 bg-indigo-900/10 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">
        #{pokemon.id.padStart(3, '0')}
      </div>
      
      <div className="flex justify-center items-center h-32 mt-4 mb-6">
        <img 
          src={imageUrl} 
          alt={`Imagen de ${pokemon.name}`}
          className="max-h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      
      <div className="text-center space-y-3">
        <h2 className="text-xl font-bold text-gray-800 capitalize tracking-wide">
          {pokemon.name}
        </h2>
        
        {loading ? (
          <div className="flex gap-1.5 justify-center">
            <div className="h-5 w-16 bg-indigo-200 rounded-full animate-pulse"></div>
          </div>
        ) : (
          <div className="flex gap-1.5 justify-center flex-wrap">
            {types.map((typeName) => (
              <span
                key={typeName}
                className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(typeName)}`}
              >
                {typeName}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
