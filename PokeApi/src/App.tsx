import ResultsGrid from "./components/ResultsGrid"
import SearchInput from "./components/SearchInput"
import TypeFilter from "./components/TypeFilter"
import { useEnhancedPokemon } from "./hooks/useEnhancedPokemon"

export default function App() {
  const {
    pokemonList,
    isLoading,
    error,
    selectedTypes,
    setTypesFilter,
    searchQuery,
    setSearchQuery,
    clearAllFilters,
    activeFiltersCount,
    hasActiveFilters
  } = useEnhancedPokemon();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="w-16 h-16 border-4 border-slate-600 border-t-purple-400 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-6 sm:px-12 lg:px-24">
      <header className="max-w-4xl mx-auto mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500 tracking-tight mb-4">
          Directorio Pokémon
        </h1>
        <p className="text-gray-500 font-medium mb-8">Búsqueda, filtros por tipo y visualización completa</p>
        
        {hasActiveFilters && (
          <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-lg mb-8">
            <span className="text-sm text-gray-600 mr-3">Filtros activos:</span>
            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg text-sm font-medium mr-2">
              {activeFiltersCount} activo{activeFiltersCount > 1 ? 's' : ''}
            </span>
            <button 
              onClick={clearAllFilters}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline"
            >
              Limpiar todo
            </button>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto space-y-7 text-center">
        <div className="mx-auto max-w-3xl">
          <SearchInput onFilter={(q) => setSearchQuery(q)} />
        </div>
        
        <div className="w-full max-w-md mx-auto">
          <TypeFilter selectedTypes={selectedTypes} onFilter={setTypesFilter} />
        </div>
        
        {pokemonList.length === 0 ? (
          <div className="text-center py-20">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0 -3.332.477 -4.5 1.253" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay Pokémon</h3>
            <p className="text-gray-500">Prueba con otros filtros o búsqueda</p>
          </div>
        ) : (
          <ResultsGrid items={pokemonList} />
        )}
      </div>
    </main>
  )
}

