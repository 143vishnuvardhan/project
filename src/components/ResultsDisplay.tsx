import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Droplets, ShieldCheck, Info, Leaf } from 'lucide-react';
import { AnalysisResult } from '../services/geminiService';
import { cn } from '../lib/utils';

interface ResultsDisplayProps {
  result: AnalysisResult;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  const isHealthy = result.diseaseName.toLowerCase().includes('healthy');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto mt-12 space-y-8 pb-20"
    >
      {/* Header Card */}
      <div className={cn(
        "p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 shadow-sm",
        isHealthy ? "bg-brand-50 border border-brand-200" : "bg-red-50 border border-red-100"
      )}>
        <div className={cn(
          "p-4 rounded-2xl",
          isHealthy ? "bg-brand-500 text-white" : "bg-red-500 text-white"
        )}>
          {isHealthy ? <ShieldCheck size={40} /> : <AlertTriangle size={40} />}
        </div>
        <div className="text-center md:text-left flex-1">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
            <h2 className="text-3xl font-serif font-semibold text-stone-900">
              {result.diseaseName}
            </h2>
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
              isHealthy ? "bg-brand-200 text-brand-800" : "bg-red-200 text-red-800"
            )}>
              {result.confidence} Confidence
            </span>
          </div>
          <p className="text-stone-600 italic font-serif">
            {isHealthy ? "Your crop appears to be in great condition." : "Immediate attention recommended to prevent spread."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Symptoms & Treatment */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                <Info size={20} />
              </div>
              <h3 className="text-xl font-serif font-semibold">Symptoms Observed</h3>
            </div>
            <ul className="space-y-3">
              {result.symptoms.map((symptom, i) => (
                <li key={i} className="flex items-start gap-3 text-stone-600">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  {symptom}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="text-xl font-serif font-semibold">Recommended Treatment</h3>
            </div>
            <p className="text-stone-600 leading-relaxed">
              {result.treatment}
            </p>
          </section>
        </div>

        {/* Fertilizer & Prevention */}
        <div className="space-y-8">
          <section className="bg-brand-900 text-white p-8 rounded-[2rem] shadow-lg relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12">
              <Leaf size={160} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-brand-800 text-brand-400">
                  <Droplets size={20} />
                </div>
                <h3 className="text-xl font-serif font-semibold">Fertilizer Recommendation</h3>
              </div>
              <p className="text-brand-100 leading-relaxed">
                {result.fertilizerRecommendation}
              </p>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-brand-100 text-brand-600">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-xl font-serif font-semibold">Prevention Tips</h3>
            </div>
            <ul className="space-y-3">
              {result.preventionTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-stone-600">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </motion.div>
  );
};
