import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Pill, Activity, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchDiseases, fetchDrugs, Disease, Drug } from '../lib/data';

type SearchResult = {
  id: string;
  name: string;
  type: 'disease' | 'drug';
};

export default function GlobalSearch({ className }: { className?: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [allData, setAllData] = useState<SearchResult[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      const [diseases, drugs] = await Promise.all([fetchDiseases(), fetchDrugs()]);
      
      const formattedData: SearchResult[] = [
        ...diseases.map((d: Disease) => ({
          id: d.OMIM_ID,
          name: d.Disease_Name,
          type: 'disease' as const
        })),
        ...drugs.map((d: Drug) => ({
          id: d.DrugBank_ID,
          name: d.Name,
          type: 'drug' as const
        }))
      ];
      
      setAllData(formattedData);
    }
    
    loadData();
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      const lowerQuery = query.toLowerCase();
      const filtered = allData.filter(
        (item) =>
          item.name?.toLowerCase().includes(lowerQuery) ||
          item.id?.toLowerCase().includes(lowerQuery)
      ).slice(0, 10); // Limit to 10 results for performance
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, allData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: SearchResult) => {
    setQuery('');
    setIsOpen(false);
    if (item.type === 'disease') {
      navigate(`/diseases/${encodeURIComponent(item.name)}`);
    } else {
      navigate(`/drugs/${encodeURIComponent(item.id)}`);
    }
  };

  return (
    <div ref={wrapperRef} className={cn('relative w-full max-w-2xl', className)}>
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow shadow-sm"
          placeholder="Search by Disease/Drug Name or ID (e.g., D104300, Ibuprofen)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
          <ul className="max-h-80 overflow-y-auto py-1">
            {results.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelect(item)}
                className="cursor-pointer select-none relative py-3 pl-4 pr-9 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
              >
                <div className="flex items-center">
                  <div
                    className={cn(
                      'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
                      item.type === 'disease' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                    )}
                  >
                    {item.type === 'disease' ? <Activity className="h-4 w-4" /> : <Pill className="h-4 w-4" />}
                  </div>
                  <div className="ml-3 flex flex-col">
                    <span className="text-sm font-medium text-slate-900 truncate">
                      {item.name}
                    </span>
                    <span className="text-xs text-slate-500 truncate">
                      {item.id} • {item.type === 'disease' ? 'Disease' : 'Drug'}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
