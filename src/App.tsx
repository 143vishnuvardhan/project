import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Sprout, Info, ChevronRight, Github, LogOut, User } from 'lucide-react';
import { ImageCapture } from './components/ImageCapture';
import { ResultsDisplay } from './components/ResultsDisplay';
import { HistoryList } from './components/HistoryList';
import { Auth } from './components/Auth';
import { analyzeCropImage, AnalysisResult } from './services/geminiService';

interface HistoryItem extends AnalysisResult {
  id: number;
  timestamp: string;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setHistory([]);
    setResult(null);
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleImageCaptured = async (base64: string) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    
    try {
      const analysis = await analyzeCropImage(base64);
      setResult(analysis);
      
      // Save to backend
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysis),
      });
      
      fetchHistory(); // Refresh history
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchHistory();
      }
    } catch (err) {
      console.error("Failed to delete history item:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={setUser} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-brand-200">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-stone-50/80 backdrop-blur-md border-bottom border-stone-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-600 rounded-xl text-white">
              <Sprout size={24} />
            </div>
            <span className="text-xl font-serif font-bold tracking-tight text-stone-900">CropSure AI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a href="#" className="hover:text-brand-600 transition-colors">How it works</a>
            <a href="#" className="hover:text-brand-600 transition-colors">Common Diseases</a>
            <a href="#" className="hover:text-brand-600 transition-colors">Fertilizer Guide</a>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-sm font-medium">
              <User size={16} />
              {user.email}
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
            <button 
              onClick={() => alert('To install this app on Android: Tap the three dots (⋮) in Chrome and select "Install app" or "Add to Home screen".\n\nOn iOS: Tap the Share button and select "Add to Home Screen".')}
              className="hidden sm:flex px-5 py-2.5 bg-brand-100 text-brand-700 rounded-full text-sm font-medium hover:bg-brand-200 transition-all"
            >
              Install App
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Leaf size={14} />
            AI-Powered Agriculture
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif font-semibold text-stone-900 leading-[1.1] mb-8"
          >
            Protect Your Yield with <span className="text-brand-600 italic">Precision</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-stone-600 leading-relaxed mb-10"
          >
            Instantly detect crop diseases and receive expert fertilizer recommendations. 
            Simply snap a photo and let our AI safeguard your harvest.
          </motion.p>
        </div>

        {/* Action Area */}
        <section className="relative">
          <ImageCapture onImageCaptured={handleImageCaptured} isAnalyzing={isAnalyzing} />
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-center text-sm font-medium max-w-md mx-auto"
            >
              {error}
            </motion.div>
          )}
        </section>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {result && <ResultsDisplay key="results" result={result} />}
        </AnimatePresence>

        {/* History Area */}
        {!result && !isAnalyzing && (
          <HistoryList history={history} onSelect={setResult} onDelete={handleDelete} />
        )}

        {/* Features Grid - Only show when no result */}
        {!result && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 pb-24"
          >
            <div className="p-8 rounded-[2.5rem] bg-white border border-stone-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mb-6">
                <Sprout size={24} />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-4">Instant Detection</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Our advanced vision models identify hundreds of crop diseases in seconds with high accuracy.
              </p>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-white border border-stone-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
                <Info size={24} />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-4">Expert Guidance</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Receive detailed treatment plans and preventive measures tailored to your specific crop issues.
              </p>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-stone-900 text-white shadow-lg hover:scale-[1.02] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center mb-6">
                <Leaf size={24} />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-4">Soil Health</h3>
              <p className="text-stone-300 text-sm leading-relaxed">
                Get smart fertilizer recommendations to optimize soil nutrients and boost your crop's natural immunity.
              </p>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-100 py-12 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-brand-600 rounded-lg text-white">
              <Sprout size={18} />
            </div>
            <span className="text-lg font-serif font-bold text-stone-900">CropSure AI</span>
          </div>
          
          <p className="text-stone-500 text-sm">
            © 2026 CropSure AI. Empowering farmers with intelligence.
          </p>
          
          <div className="flex gap-6">
            <a href="#" className="text-stone-400 hover:text-stone-900 transition-colors"><Github size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
