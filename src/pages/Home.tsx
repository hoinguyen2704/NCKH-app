import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Activity, Pill, ArrowRight, Sparkles, Network } from 'lucide-react';
import { fetchDiseases, fetchDrugs } from '../lib/data';
import { motion } from 'motion/react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState({ diseases: 0, drugs: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    async function loadStats() {
      try {
        const [diseases, drugs] = await Promise.all([fetchDiseases(), fetchDrugs()]);
        setStats({
          diseases: diseases.length,
          drugs: drugs.length
        });
      } catch (error) {
        console.error("Failed to load stats:", error);
      }
    }
    loadStats();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/diseases/${encodeURIComponent(query.trim())}`);
    }
  };

  const exampleDiseases = [
    'Alzheimer',
    'Parkinson',
    'Restless Legs Syndrome',
    'Lung Cancer',
    'Diabetes'
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 flex flex-col items-center justify-center -mt-8">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-300 via-blue-400 to-purple-400 blur-[100px] rounded-full mix-blend-multiply" />
      </div>
      
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-20 flex flex-col items-center text-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm mb-8"
        >
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span className="text-sm font-medium text-slate-700">Powered by Advanced AI & Network Medicine</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight"
        >
          Discover New Cures with <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
            Drug Repurposing
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-slate-600 mb-12 max-w-2xl leading-relaxed"
        >
          Accelerate medical research by predicting novel therapeutic uses for existing drugs using our state-of-the-art machine learning models.
        </motion.p>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-3xl mb-12"
        >
          <form onSubmit={handleSearch} className="relative flex items-center shadow-2xl shadow-teal-900/10 rounded-2xl bg-white p-2 border border-slate-100">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-14 pr-36 py-4 bg-transparent border-none focus:ring-0 text-lg placeholder-slate-400 text-slate-900 outline-none"
              placeholder="Search for a disease (e.g., Alzheimer)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-8 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              Analyze
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
          
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500">
            <span className="font-medium mr-2">Popular searches:</span>
            {exampleDiseases.map((disease) => (
              <button
                key={disease}
                onClick={() => setQuery(disease)}
                className="px-4 py-1.5 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 rounded-full transition-colors border border-slate-200 shadow-sm"
              >
                {disease}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-8"
        >
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
            <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
              <Activity className="h-8 w-8" />
            </div>
            <div className="text-4xl font-black text-slate-900 mb-2">
              {stats.diseases > 0 ? stats.diseases.toLocaleString() : '...'}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Diseases Indexed</div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
              <Pill className="h-8 w-8" />
            </div>
            <div className="text-4xl font-black text-slate-900 mb-2">
              {stats.drugs > 0 ? stats.drugs.toLocaleString() : '...'}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Drugs Analyzed</div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
            <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
              <Network className="h-8 w-8" />
            </div>
            <div className="text-4xl font-black text-slate-900 mb-2">1.2M+</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Interactions</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
