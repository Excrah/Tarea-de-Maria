import { useState } from 'react';

const ALL_TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice', 
  'fighting', 'poison', 'ground', 'flying', 'psychic', 
  'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
] as const;

type TypeName = typeof ALL_TYPES[number];

interface TypeFilterProps {
  onFilter: (types: TypeName[]) => void;
  selectedTypes: TypeName[];
}

export default function TypeFilter({ onFilter, selectedTypes }: TypeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleType = (type: TypeName) => {
    const newSelected = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    onFilter(newSelected);
  };

  const clearFilters = () => onFilter([]);

  const typeColor = (type: TypeName): string => {
    const colors: Record<TypeName, string> = {
      normal: 'bg-yellow-100 hover:bg-yellow-200',
      fire: 'bg-red-100 hover:bg-red-200',
      water: 'bg-blue-100 hover:bg-blue-200',
      grass: 'bg-green-100 hover:bg-green-200',
      electric: 'bg-yellow-200 hover:bg-yellow-300',
      ice: 'bg-cyan-100 hover:bg-cyan-200',
      fighting: 'bg-orange-100 hover:bg-orange-200',
      poison: 'bg-purple-100 hover:bg-purple-200',
      ground: 'bg-amber-200 hover:bg-amber-300',
      flying: 'bg-indigo-100 hover:bg-indigo-200',
      psychic: 'bg-pink-100 hover:bg-pink-200',
      bug: 'bg-lime-100 hover:bg-lime-200',
      rock: 'bg-gray-200 hover:bg-gray-300',
      ghost: 'bg-violet-200 hover:bg-violet-300',
      dragon: 'bg-purple-200 hover:bg-purple-300',
      dark: 'bg-gray-600 hover:bg-gray-700 text-white',
      steel: 'bg-gray-100 hover:bg-gray-200',
      fairy: 'bg-pink-200 hover:bg-pink-300'
    };
    return colors[type];
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span className="font-medium">
          {selectedTypes.length ? `${selectedTypes.length} tipo${selectedTypes.length > 1 ? 's' : ''}` : 'Todos los tipos'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 max-h-64 overflow-y-auto bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl z-50 p-4">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Filtrar por tipo</h3>
            {selectedTypes.length > 0 && (
              <button 
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Limpiar
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {ALL_TYPES.map(type => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all duration-200 transform hover:scale-105 ${
                  selectedTypes.includes(type)
                    ? typeColor(type).replace('hover', '') + ' ring-2 ring-offset-1 ring-indigo-300 shadow-md font-bold'
                    : typeColor(type) + ' shadow-sm'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

