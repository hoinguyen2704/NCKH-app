import { useState, useEffect } from 'react';
import { Search, Filter, Activity, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDiseases, Disease } from '../lib/data';

export default function DiseaseSearch() {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    async function loadData() {
      const data = await fetchDiseases();
      setDiseases(data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query, categoryFilter]);

  const filteredDiseases = diseases.filter((disease) => {
    const matchesQuery = disease.Disease_Name?.toLowerCase().includes(query.toLowerCase()) || disease.OMIM_ID?.toLowerCase().includes(query.toLowerCase());
    // For now, we don't have category in CSV, so we just filter by query
    return matchesQuery;
  });

  const totalPages = Math.ceil(filteredDiseases.length / itemsPerPage);
  const currentDiseases = filteredDiseases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const categories = ['All']; // Simplified since we don't have categories in CSV yet

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Activity className="h-8 w-8 text-red-500" />
          Disease Search
        </h1>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search by Disease Name or OMIM ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-slate-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat} Category</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-slate-500 uppercase tracking-wider">Disease</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-slate-500 uppercase tracking-wider">Organ System</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-slate-500 uppercase tracking-wider">Associated Genes</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-slate-500 uppercase tracking-wider">Known Drugs</th>
                <th scope="col" className="relative px-6 py-4"><span className="sr-only">View</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Loading diseases...
                  </td>
                </tr>
              ) : currentDiseases.map((disease) => (
                <tr key={disease.OMIM_ID} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-red-50 rounded-full flex items-center justify-center">
                        <Activity className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-base font-medium text-slate-900 truncate max-w-[300px]" title={disease.Disease_Name}>{disease.Disease_Name}</div>
                        <div className="text-sm text-slate-500">{disease.OMIM_ID}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">
                      Unknown
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-slate-500">
                    Unknown
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-slate-500">
                    <div className="flex gap-1 flex-wrap max-w-[200px]">
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-sm font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        N/A
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-slate-500">
                    <span className="font-medium text-slate-400">-</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-base font-medium">
                    <Link to={`/diseases/${encodeURIComponent(disease.Disease_Name)}`} className="text-blue-600 hover:text-blue-900 flex items-center justify-end">
                      View AI Repurposing
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!loading && filteredDiseases.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-white mt-auto">
            <div className="text-sm text-slate-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredDiseases.length)}</span> of <span className="font-medium">{filteredDiseases.length}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {!loading && filteredDiseases.length === 0 && (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No diseases found</h3>
            <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
