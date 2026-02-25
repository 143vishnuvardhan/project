import React from 'react';
import { motion } from 'motion/react';
import { History, Clock, ChevronRight, Trash2 } from 'lucide-react';
import { AnalysisResult } from '../services/geminiService';

interface HistoryItem extends AnalysisResult {
  id: number;
  timestamp: string;
}

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: number) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onDelete }) => {
  if (history.length === 0) return null;

  return (
    <section className="mt-20 mb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-stone-200 text-stone-600">
          <History size={20} />
        </div>
        <h3 className="text-2xl font-serif font-semibold">Recent Analyses</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -4 }}
            className="relative group"
          >
            <button
              onClick={() => onSelect(item)}
              className="w-full p-6 rounded-3xl bg-white border border-stone-100 shadow-sm hover:shadow-md transition-all text-left"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-1 rounded">
                  {item.confidence}
                </span>
                <div className="flex items-center gap-1 text-stone-400 text-xs">
                  <Clock size={12} />
                  {new Date(item.timestamp).toLocaleDateString()}
                </div>
              </div>
              <h4 className="text-lg font-serif font-bold text-stone-900 mb-2 group-hover:text-brand-600 transition-colors">
                {item.diseaseName}
              </h4>
              <div className="flex items-center justify-between mt-4 text-stone-400 text-sm font-medium">
                <span>View Details</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all z-10"
              title="Delete analysis"
            >
              <Trash2 size={14} />
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
