import { useParams, Link } from 'react-router-dom';
import { Pill, Activity, ExternalLink, Beaker, FileText, Network } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchDrugs, Drug } from '../lib/data';

export default function DrugDetail() {
  const { id } = useParams();
  const [drug, setDrug] = useState<Drug | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const drugs = await fetchDrugs();
      const foundDrug = drugs.find(d => d.DrugBank_ID === id);
      setDrug(foundDrug || null);
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-500">Loading drug details...</div>
      </div>
    );
  }

  if (!drug) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Pill className="h-12 w-12 text-slate-300" />
        <h2 className="text-xl font-medium text-slate-900">Drug not found</h2>
        <p className="text-slate-500">Could not find details for "{id}"</p>
        <Link to="/drugs" className="text-blue-600 hover:underline">Return to Drug Search</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Drug Header */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-emerald-100 p-2 rounded-xl">
                <Pill className="h-6 w-6 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">{drug.Name}</h1>
            </div>
            <p className="text-slate-500 font-mono text-sm">{drug.DrugBank_ID}</p>
          </div>
          <Link to="/visualization" className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            <Network className="h-4 w-4 mr-2 text-blue-500" />
            View Network Graph
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center mb-4">
                <Beaker className="h-5 w-5 mr-2 text-purple-500" />
                Mechanism of Action
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Information about the mechanism of action for {drug.Name} is currently unavailable in the database.
              </p>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Target Proteins</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-slate-100 text-slate-800 border border-slate-200">Unknown</span>
                </div>
              </section>

              <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Drug Type</h2>
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Unknown
                </span>
              </section>
            </div>
          </div>

          <div className="lg:col-span-1">
            <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100 h-full flex flex-col">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Molecular Structure</h2>
              <div className="flex-1 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-4 min-h-[200px]">
                {/* Placeholder for molecular visualization */}
                <div className="text-center text-slate-400">
                  <Beaker className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">2D Structure Visualization</p>
                  <p className="text-xs">Not available</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Treatable Diseases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center mb-6">
            <Activity className="h-6 w-6 mr-2 text-red-500" />
            Approved Indications
          </h2>
          <div className="text-slate-500 text-center py-8">
            <p>No indication data available for this drug.</p>
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center mb-6">
            <FileText className="h-6 w-6 mr-2 text-blue-500" />
            Related Publications
          </h2>
          <div className="text-slate-500 text-center py-8">
            <p>No related publications found.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
