import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Sparkles, ArrowLeft, GitBranch, Star, Clock } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-teal-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>
      </div>

      <Card padding="lg" className="border-teal-500/20 bg-slate-900/80 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">@{username || 'developer'}</h1>
                <Badge variant="teal" size="sm">GitHub Developer</Badge>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Developer profile query scaffolded for Increment 3 ingestion.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to={`/compare?devs=${username || ''}`}>
              <Button variant="secondary" size="sm">
                Compare Developer
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Increment 3 Roadmap Notice */}
      <Card padding="lg" className="border-dashed border-slate-700 bg-slate-900/30 text-center py-12">
        <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-white">Live GitHub Ingestion Scheduled for Increment 3</h3>
        <p className="text-sm text-slate-400 max-w-lg mx-auto mt-2 leading-relaxed">
          In Increment 3, this dashboard will ingest live data from the GitHub API (<code className="text-teal-400 font-mono text-xs">/users/{username}</code> and <code className="text-teal-400 font-mono text-xs">/users/{username}/repos</code>), compute total stars, generate language distribution graphs, and track commit velocity with PostgreSQL caching.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <Star className="w-3.5 h-3.5 text-amber-400" /> Total Stars Aggregation
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <GitBranch className="w-3.5 h-3.5 text-teal-400" /> Language Breakdown
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-blue-400" /> Commit Activity Timeline
          </span>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
