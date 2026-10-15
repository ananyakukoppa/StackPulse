import React from 'react';
import { GitCompare, Sparkles, ArrowLeft, BarChart3, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

export const ComparePage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-teal-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">Compare Developers</h1>
            <Badge variant="blue" size="sm">Signature Feature</Badge>
          </div>
          <p className="text-sm text-slate-400">
            Side-by-side metric benchmarking across GitHub developers.
          </p>
        </div>
      </div>

      {/* Increment 4 Roadmap Notice */}
      <Card padding="lg" className="border-dashed border-slate-700 bg-slate-900/30 text-center py-12">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-4">
          <GitCompare className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-white">Head-to-Head Comparison Engine Scheduled for Increment 4</h3>
        <p className="text-sm text-slate-400 max-w-lg mx-auto mt-2 leading-relaxed">
          In Increment 4, this page will host the signature multi-developer compare matrix with side-by-side metric tables, comparative star bar charts, top programming language overlap, commit velocity, and the ability to save named comparisons.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <Users className="w-3.5 h-3.5 text-teal-400" /> Multi-Developer Selector
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" /> Head-to-Head Visual Charts
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Saved Named Comparisons
          </span>
        </div>
      </Card>
    </div>
  );
};

export default ComparePage;
