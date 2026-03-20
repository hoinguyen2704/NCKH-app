import { useState, useEffect } from 'react';
import { Search, Pill, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDrugs, Drug } from '../lib/data';

export default function DrugSearch() {
  const [query, setQuery] = useState('');
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    async function loadData() {
      const data = await fetchDrugs();
      setDrugs(data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const filteredDrugs = drugs.filter((drug) => {
    return drug.Name?.toLowerCase().includes(query.toLowerCase()) || drug.DrugBank_ID?.toLowerCase().includes(query.toLowerCase());
  });

  const totalPages = Math.ceil(filteredDrugs.length / itemsPerPage);
  const currentDrugs = filteredDrugs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Pill className="h-8 w-8 text-emerald-500" />
          Drug Search
        </h1>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="relative w-full max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            placeholder="Search by Drug Name or DrugBank ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-slate-500 uppercase tracking-wider">Drug</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-slate-500 uppercase tracking-wider">Mechanism of Action</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-slate-500 uppercase tracking-wider">Target Proteins</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-slate-500 uppercase tracking-wider">Known Diseases</th>
                <th scope="col" className="relative px-6 py-4"><span className="sr-only">View</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Loading drugs...
                  </td>
                </tr>
              ) : currentDrugs.map((drug) => (
                <tr key={drug.DrugBank_ID} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center">
                        <Pill className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-base font-medium text-slate-900 truncate max-w-[200px]" title={drug.Name}>{drug.Name}</div>
                        <div className="text-sm text-slate-500">{drug.DrugBank_ID}</div>
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
                    <Link to={`/drugs/${encodeURIComponent(drug.DrugBank_ID)}`} className="text-emerald-600 hover:text-emerald-900 flex items-center justify-end">
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!loading && filteredDrugs.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-white mt-auto">
            <div className="text-sm text-slate-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredDrugs.length)}</span> of <span className="font-medium">{filteredDrugs.length}</span> results
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

        {!loading && filteredDrugs.length === 0 && (
          <div className="text-center py-12">
            <Pill className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No drugs found</h3>
            <p className="mt-1 text-sm text-slate-500">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
