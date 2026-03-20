import { useParams, Link } from 'react-router-dom';
import { Activity, Pill, Download, CheckCircle2, XCircle, Loader2, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchDiseases, Disease } from '../lib/data';
import { explainDrugRepurposing } from '../services/geminiService';

type Recommendation = {
  rank: number;
  drug_id: string;
  drug_name: string;
  probability: number;
  known_usage: boolean;
};

function AIInsightCell({ drugName, diseaseName }: { drugName: string, diseaseName: string }) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    setLoading(true);
    const result = await explainDrugRepurposing(drugName, diseaseName);
    setInsight(result);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center text-teal-600 text-sm">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Analyzing...
      </div>
    );
  }

  if (insight) {
    return (
      <div className="text-sm text-slate-700 bg-teal-50 p-3 rounded-lg border border-teal-100">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
          <p className="leading-relaxed">{insight}</p>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleAskAI}
      className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50 text-teal-700 text-sm font-medium rounded-lg transition-colors"
    >
      <Sparkles className="w-4 h-4 mr-1.5" />
      Ask AI Why
    </button>
  );
}

export default function DrugRecommendation() {
  const { id } = useParams();
  const [disease, setDisease] = useState<Disease | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const diseases = await fetchDiseases();
        // Try to match by name or ID
        const foundDisease = diseases.find(
          d => d.Disease_Name?.toLowerCase() === id?.toLowerCase() || d.OMIM_ID?.toLowerCase() === id?.toLowerCase()
        );
        
        setDisease(foundDisease || { Disease_Name: id || 'Unknown Disease', OMIM_ID: 'N/A' } as Disease);

        // Simulate API call to ML model
        setTimeout(() => {
          const mockData: Recommendation[] = Array.from({ length: 20 }).map((_, i) => {
            const isKnown = Math.random() > 0.85;
            return {
              rank: i + 1,
              drug_id: `DB${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
              drug_name: ['Prochlorperazine', 'Dextromethorphan', 'Diphenidol', 'Pregabalin', 'Ibuprofen', 'Metformin', 'Aspirin', 'Imatinib', 'Lapatinib', 'Erlotinib'][Math.floor(Math.random() * 10)],
              probability: 0.9989 - (i * 0.004) - (Math.random() * 0.001),
              known_usage: isKnown
            };
          });
          
          // Sort by probability descending just to be sure
          mockData.sort((a, b) => b.probability - a.probability);
          // Re-assign ranks
          mockData.forEach((item, idx) => item.rank = idx + 1);
          
          setRecommendations(mockData);
          setLoading(false);
        }, 2000); // Simulate 2s loading time for the AI model
        
      } catch (error) {
        console.error("Failed to load data:", error);
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleExportCSV = () => {
    const headers = ['Rank', 'Drug ID', 'Drug Name', 'Probability', 'Known Usage'];
    const csvContent = [
      headers.join(','),
      ...recommendations.map(r => 
        `${r.rank},${r.drug_id},"${r.drug_name}",${r.probability},${r.known_usage ? 'Yes' : 'No'}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${disease?.Disease_Name || 'disease'}_repurposing_results.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-teal-500/20 animate-pulse"></div>
          <Loader2 className="h-16 w-16 text-teal-600 animate-spin relative z-10" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Running AI Model...</h2>
          <p className="text-slate-500">Analyzing molecular networks and predicting drug candidates for {id}</p>
        </div>
      </div>
    );
  }

  if (!disease && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Activity className="h-12 w-12 text-slate-300" />
        <h2 className="text-xl font-medium text-slate-900">Disease not found</h2>
        <p className="text-slate-500">Could not find details for "{id}"</p>
        <Link to="/" className="text-teal-600 hover:underline">Return to Home</Link>
      </div>
    );
  }

  const novelCount = recommendations.filter(r => !r.known_usage).length;
  const knownCount = recommendations.filter(r => r.known_usage).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-teal-50 p-3 rounded-2xl">
                <Activity className="h-8 w-8 text-teal-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{disease?.Disease_Name}</h1>
                <p className="text-slate-500 font-mono text-sm mt-1">ID: {disease?.OMIM_ID}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleExportCSV}
            className="inline-flex items-center px-5 py-2.5 bg-white border-2 border-slate-200 hover:border-teal-500 hover:text-teal-700 text-slate-700 font-medium rounded-xl transition-colors shadow-sm"
          >
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1 uppercase tracking-wider">Total Predictions</p>
              <p className="text-3xl font-bold text-slate-900">{recommendations.length}</p>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-teal-50 p-5 rounded-2xl border border-teal-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-teal-800 mb-1 uppercase tracking-wider">Novel Drug Candidates</p>
              <p className="text-3xl font-bold text-teal-900">{novelCount}</p>
            </div>
            <div className="p-3 bg-teal-200 text-teal-700 rounded-xl">
              <Pill className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1 uppercase tracking-wider">Previously Known Drugs</p>
              <p className="text-3xl font-bold text-slate-900">{knownCount}</p>
            </div>
            <div className="p-3 bg-slate-200 text-slate-700 rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">Top Drug Candidates</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200">
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-20">Rank</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Drug ID</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Drug Name</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-48">Probability</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-40">Known Usage</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-80">AI Insight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recommendations.map((rec) => (
                <tr 
                  key={rec.drug_id} 
                  className={`hover:bg-slate-50 transition-colors ${!rec.known_usage ? 'bg-teal-50/30' : ''}`}
                >
                  <td className="px-8 py-5 align-top">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm">
                      {rec.rank}
                    </span>
                  </td>
                  <td className="px-8 py-5 align-top">
                    <span className="font-mono text-sm text-slate-500">{rec.drug_id}</span>
                  </td>
                  <td className="px-8 py-5 align-top">
                    <Link to={`/drugs/${rec.drug_id}`} className="font-bold text-slate-900 hover:text-teal-600 transition-colors">
                      {rec.drug_name}
                    </Link>
                  </td>
                  <td className="px-8 py-5 align-top">
                    <div className="flex flex-col gap-1.5 mt-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-slate-700">{(rec.probability * 100).toFixed(2)}%</span>
                        <span className="text-slate-400 text-xs">{rec.probability.toFixed(4)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-teal-500 h-2 rounded-full" 
                          style={{ width: `${rec.probability * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 align-top">
                    {rec.known_usage ? (
                      <div className="flex items-center text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg w-fit mt-0.5">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-slate-500" />
                        <span className="text-sm font-medium">Previously used</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-teal-700 bg-teal-100 px-3 py-1.5 rounded-lg w-fit border border-teal-200 mt-0.5">
                        <XCircle className="w-4 h-4 mr-2 text-teal-600" />
                        <span className="text-sm font-bold">Not previously used</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-5 align-top">
                    <AIInsightCell drugName={rec.drug_name} diseaseName={disease?.Disease_Name || ''} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
