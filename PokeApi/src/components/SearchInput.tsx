export default function SearchInput({ onFilter }: { onFilter: (value: string) => void }) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <div className="relative flex items-center w-full h-14 rounded-xl focus-within:shadow-lg bg-white overflow-hidden border border-indigo-100">
        <div className="grid place-items-center h-full w-12 text-indigo-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          className="peer h-full w-full outline-none text-sm text-gray-700 pr-2 bg-transparent"
          type="text"
          id="search"
          placeholder="Escribe el nombre del Pokémon..."
          onChange={(e) => onFilter(e.target.value)}
        />
      </div>
    </div>
  )
}