import React from 'react';
import { Bookmark, Tag, Lock, ArrowLeft, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

export const CurationsPage: React.FC = () => {
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
            <h1 className="text-2xl font-bold text-white">My Curations & Pins</h1>
            <Badge variant="purple" size="sm">Private Workspace</Badge>
          </div>
          <p className="text-sm text-slate-400">
            Your pinned favorite repositories, personal notes, and custom taxonomies.
          </p>
        </div>
      </div>

      {/* Increment 5 Roadmap Notice */}
      <Card padding="lg" className="border-dashed border-slate-700 bg-slate-900/30 text-center py-12">
        <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-4">
          <Bookmark className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-white">Curations & Tagging Engine Scheduled for Increment 5</h3>
        <p className="text-sm text-slate-400 max-w-lg mx-auto mt-2 leading-relaxed">
          In Increment 5, authenticated users will be able to pin repositories directly from developer profile and comparison views, add markdown notes, attach searchable tag badges, and manage their personal developer bookmark collection.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <Heart className="w-3.5 h-3.5 text-rose-400" /> One-Click Repository Pinning
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <Tag className="w-3.5 h-3.5 text-teal-400" /> Custom Tags & Notes
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <Lock className="w-3.5 h-3.5 text-purple-400" /> Strict User Data Privacy
          </span>
        </div>
      </Card>
    </div>
  );
};

export default CurationsPage;
