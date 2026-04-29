export type PokemonType = {
  slot: number;
  type: {
    name: string;
  }
}

export type DetailedPokemon = {
  name: string;
  id: string;
  types: PokemonType[];
}

export type Pokemon = DetailedPokemon | {
  name: string;
  id: string;
};

