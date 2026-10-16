import React from 'react';
import { Activity, ShieldCheck, Database, Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-900 bg-slate-950/60 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Activity className="w-4 h-4 text-teal-400" />
            <span className="font-semibold text-slate-200">StackPulse</span>
            <span className="text-slate-600">•</span>
            <span>Developer Intelligence & GitHub Comparison Engine</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 hover:text-slate-400 transition-colors">
              <Database className="w-3.5 h-3.5 text-teal-500" /> PostgreSQL
            </span>
            <span className="flex items-center gap-1.5 hover:text-slate-400 transition-colors">
              <Layers className="w-3.5 h-3.5 text-blue-500" /> React 18 + TypeScript
            </span>
            <span className="flex items-center gap-1.5 hover:text-slate-400 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> REST API Caching
            </span>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            v1.0.0
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
