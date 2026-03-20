import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Filter, Search, Maximize2, ZoomIn, ZoomOut, Network } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchDiseases, fetchDrugs, Disease, Drug } from '../lib/data';

type Node = {
  id: string;
  group: number;
  label: string;
  type: 'Disease' | 'Gene' | 'Protein' | 'Drug';
};

type Link = {
  source: string;
  target: string;
  value: number;
  type: 'treat' | 'associate' | 'target';
};

const colorScale = d3.scaleOrdinal<string>()
  .domain(['Disease', 'Gene', 'Protein', 'Drug'])
  .range(['#ef4444', '#3b82f6', '#a855f7', '#10b981']); // Red, Blue, Purple, Green

export default function Visualization() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [graphData, setGraphData] = useState<{ nodes: Node[]; links: Link[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [diseases, drugs] = await Promise.all([fetchDiseases(), fetchDrugs()]);
        
        // Take a subset for visualization to keep it manageable
        const subsetDiseases = diseases.slice(0, 20);
        const subsetDrugs = drugs.slice(0, 20);
        
        const nodes: Node[] = [];
        const links: Link[] = [];
        
        // Add disease nodes
        subsetDiseases.forEach((d: Disease) => {
          nodes.push({
            id: d.OMIM_ID,
            group: 1,
            label: d.Disease_Name,
            type: 'Disease'
          });
        });
        
        // Add drug nodes
        subsetDrugs.forEach((d: Drug) => {
          nodes.push({
            id: d.DrugBank_ID,
            group: 4,
            label: d.Name,
            type: 'Drug'
          });
        });
        
        // Create some artificial links for demonstration since we don't have a relationship table yet
        // In a real app, this would come from a relationships CSV or API
        subsetDrugs.forEach((drug: Drug, i: number) => {
          // Link each drug to 1-3 random diseases
          const numLinks = Math.floor(Math.random() * 3) + 1;
          for (let j = 0; j < numLinks; j++) {
            const randomDisease = subsetDiseases[Math.floor(Math.random() * subsetDiseases.length)];
            links.push({
              source: drug.DrugBank_ID,
              target: randomDisease.OMIM_ID,
              value: Math.floor(Math.random() * 5) + 1,
              type: 'treat'
            });
          }
        });

        setGraphData({ nodes, links });
      } catch (error) {
        console.error("Failed to load graph data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || graphData.nodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Filter data based on search and type filter
    const filteredNodes = graphData.nodes.filter(n => {
      const matchType = filter === 'All' || n.type === filter;
      const matchSearch = n.label?.toLowerCase().includes(searchQuery.toLowerCase()) || n.id?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    
    // Include links where both source and target are in filtered nodes
    // Or if search is empty, just show all links between filtered nodes
    const filteredLinks = graphData.links.filter(l => 
      filteredNodeIds.has(typeof l.source === 'string' ? l.source : (l.source as any).id) && 
      filteredNodeIds.has(typeof l.target === 'string' ? l.target : (l.target as any).id)
    );

    // Deep copy for D3 simulation
    const nodes = filteredNodes.map(d => Object.create(d));
    const links = filteredLinks.map(d => Object.create(d));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(40));

    // Draw links
    const link = g.append('g')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => Math.sqrt(d.value))
      .attr('stroke-dasharray', d => d.type === 'associate' ? '5,5' : 'none');

    // Draw nodes
    const node = g.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => d.type === 'Disease' ? 16 : d.type === 'Drug' ? 14 : 10)
      .attr('fill', d => colorScale(d.type))
      .call(drag(simulation) as any);

    node.append('title')
      .text(d => `${d.label} (${d.type})\nID: ${d.id}`);

    // Add labels
    const labels = g.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => d.label)
      .attr('font-size', '12px')
      .attr('dx', 20)
      .attr('dy', 4)
      .attr('fill', '#334155')
      .attr('font-family', 'sans-serif')
      .attr('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      labels
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    function drag(simulation: d3.Simulation<any, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }

    return () => {
      simulation.stop();
    };
  }, [filter, searchQuery, graphData]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Network className="h-8 w-8 text-blue-500" />
          Knowledge Graph
        </h1>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search nodes by Name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-slate-400" />
          </div>
          <select
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Node Types</option>
            <option value="Disease">Disease</option>
            <option value="Drug">Drug</option>
            <option value="Gene">Gene</option>
            <option value="Protein">Protein</option>
          </select>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden" ref={containerRef}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : null}
        <svg ref={svgRef} className="w-full h-full cursor-move" />
        
        {/* Legend */}
        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Node Types</h3>
          <div className="space-y-2">
            {[
              { label: 'Disease', color: 'bg-red-500' },
              { label: 'Drug', color: 'bg-emerald-500' },
              { label: 'Gene', color: 'bg-blue-500' },
              { label: 'Protein', color: 'bg-purple-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center text-sm text-slate-700">
                <div className={`w-3 h-3 rounded-full ${item.color} mr-2`} />
                {item.label}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Edge Types</h3>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-center">
                <div className="w-6 h-0.5 bg-slate-400 mr-2" />
                Treats / Targets
              </div>
              <div className="flex items-center">
                <div className="w-6 h-0.5 bg-slate-400 border-dashed border-t-2 border-slate-400 mr-2" />
                Associates
              </div>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="absolute top-6 right-6 flex flex-col gap-2">
          <button className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50">
            <ZoomOut className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50">
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
