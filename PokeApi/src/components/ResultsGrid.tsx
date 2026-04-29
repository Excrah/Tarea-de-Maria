import type { Pokemon } from "../types/pokemon";
import PokedexEntry from "./PokedexEntry";

interface ResultsGridProps {
  items: Pokemon[];
}

export default function ResultsGrid({ items }: ResultsGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-indigo-400">
        <p className="text-xl font-medium">No hay coincidencias en la base de datos.</p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {items.map((poke) => (
        <PokedexEntry key={poke.id} pokemon={poke} />
      ))}
    </section>
  )
}