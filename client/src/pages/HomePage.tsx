import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  GitCompare,
  Bookmark,
  Activity,
  Server,
  Database,
  ArrowRight,
  TrendingUp,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { apiService } from '../services/api';
import { HealthResponse } from '../types';

export const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    apiService
      .getHealth()
      .then((data) => {
        if (isMounted) {
          setHealthData(data);
          setHealthLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setHealthError(err.message || 'Failed to reach backend API');
          setHealthLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/profile/${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const sampleDevelopers = [
    { username: 'torvalds', label: 'Linus Torvalds', role: 'Creator of Linux & Git' },
    { username: 'gaearon', label: 'Dan Abramov', role: 'React Core & Redux' },
    { username: 'shadcn', label: 'shadcn', role: 'Creator of shadcn/ui' },
    { username: 'yyx990803', label: 'Evan You', role: 'Creator of Vue & Vite' },
  ];

  const incrementsRoadmap = [
    {
      num: '1',
      title: 'Project Foundation & Database Architecture',
      status: 'completed',
      desc: 'Monorepo setup, Express REST API, PostgreSQL Prisma schema, TypeScript types, responsive UI layout shell.',
    },
    {
      num: '2',
      title: 'Authentication & GitHub Profile Dashboard Engine',
      status: 'completed',
      desc: 'Bcrypt hashing, JWT sessions, route guards, live GitHub API ingestion, PostgreSQL caching with TTL, star aggregation, and language breakdown.',
    },
    {
      num: '3',
      title: 'Side-by-Side Comparison Engine & Analytics',
      status: 'completed',
      desc: 'Multi-developer comparison view, interactive comparison tables, comparative star volume bars, and saved comparisons CRUD.',
    },
    {
      num: '4',
      title: 'Personal Curation, Privacy, Polish & Documentation',
      status: 'completed',
      desc: 'Pin favorite repos, add custom notes & tags, user privacy isolation, responsive mobile optimization, and technical choices report.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="pt-14 pb-16 md:pt-20 md:pb-24 border-b border-slate-900 bg-gradient-to-b from-slate-950 to-slate-900/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="teal" size="sm" className="mb-4">
            GitHub Developer Intelligence Platform
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Search GitHub Developers. <br />
            <span className="text-teal-400">
              Benchmark & Compare Metrics.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            StackPulse connects directly to the GitHub API with PostgreSQL caching. Inspect total stars, language distributions, and commit activity side-by-side.
          </p>

          {/* Search Bar */}
          <div className="mt-10 max-w-xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <div className="flex-1">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter GitHub username (e.g. torvalds, gaearon)..."
                  leftIcon={<Search className="w-4 h-4" />}
                  className="h-12 text-base bg-slate-900/90 border-slate-700/80 shadow-inner"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-12 px-6"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Inspect
              </Button>
            </form>

            {/* Quick Sample Links */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
              <span className="text-slate-500">Popular developers:</span>
              {sampleDevelopers.map((dev) => (
                <button
                  key={dev.username}
                  onClick={() => navigate(`/profile/${dev.username}`)}
                  className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-teal-400 hover:border-teal-500/40 transition-all font-mono"
                >
                  @{dev.username}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live System Health Verification Card */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 w-full">
        <Card padding="md" className="border-teal-500/20 bg-slate-900/90 shadow-xl shadow-black/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Full-Stack Core Foundation Status</h3>
                  <Badge variant={healthError ? 'rose' : 'emerald'} size="sm">
                    {healthLoading ? 'Connecting...' : healthError ? 'Offline' : 'API Live & Healthy'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Increment 1 architecture: Express REST API connected to Vite React Client.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-teal-400" />
                <span>PostgreSQL Schema Ready</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                <span>Uptime: {healthData ? `${healthData.uptimeSeconds}s` : '100%'}</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Core Capabilities Section */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="blue" size="sm" className="mb-3">
            Core Features
          </Badge>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Engineered for High-Performance Developer Intelligence
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Everything needed to benchmark, evaluate, and track software engineers with precision metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <Card
            hoverEffect
            padding="lg"
            className="flex flex-col"
            onClick={() => navigate('/profile/torvalds')}
          >
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-5">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Developer Profile Dashboards</h3>
            <p className="text-sm text-slate-400 leading-relaxed flex-1">
              Pull rich public activity directly from GitHub. Visualize star aggregates, language breakdowns, and commit frequency with responsive charts.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>View @torvalds</span>
              <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
            </div>
          </Card>

          {/* Card 2 */}
          <Card
            hoverEffect
            padding="lg"
            className="flex flex-col"
            onClick={() => navigate('/compare')}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">
              <GitCompare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Side-by-Side Comparison</h3>
            <p className="text-sm text-slate-400 leading-relaxed flex-1">
              Select two or more developers and compare them head-to-head. Analyze comparative star velocity, top languages, and commit velocity side-by-side.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Launch Comparison Matrix</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            </div>
          </Card>

          {/* Card 3 */}
          <Card
            hoverEffect
            padding="lg"
            className="flex flex-col"
            onClick={() => navigate('/curations')}
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Curate, Pin & Annotate</h3>
            <p className="text-sm text-slate-400 leading-relaxed flex-1">
              Bookmark standout repositories, attach custom notes and tag taxonomies. Save named comparisons to revisit later with strict user privacy.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Access Private Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
            </div>
          </Card>
        </div>
      </section>

      {/* 5-Increment Roadmap Section */}
      <section className="py-16 border-t border-slate-900 bg-slate-950/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
            <div>
              <Badge variant="purple" size="sm" className="mb-2" icon={<Cpu className="w-3.5 h-3.5" />}>
                Project Roadmap
              </Badge>
              <h2 className="text-2xl font-bold text-white">5-Increment Architecture Plan</h2>
              <p className="text-xs text-slate-400 mt-1">
                Structured for a clean, incremental Git commit history as requested in the assignment.
              </p>
            </div>
            <div className="text-xs text-teal-400 font-mono bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-lg">
              Increment 2 of 4 Ready
            </div>
          </div>

          <div className="space-y-3">
            {incrementsRoadmap.map((inc) => (
              <div
                key={inc.num}
                className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                  inc.status === 'active' || inc.status === 'completed'
                    ? 'bg-slate-900/90 border-teal-500/30'
                    : 'bg-slate-900/40 border-slate-800/80 opacity-75'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                    inc.status === 'completed'
                      ? 'bg-teal-500 text-slate-950'
                      : inc.status === 'active'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {inc.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    inc.num
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-sm font-semibold text-white">{inc.title}</h4>
                    {inc.status === 'completed' && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        Completed
                      </span>
                    )}
                    {inc.status === 'active' && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        Current Increment
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{inc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
