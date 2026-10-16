import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  GitFork,
  BookOpen,
  Users,
  MapPin,
  Building,
  Link as LinkIcon,
  Twitter,
  ExternalLink,
  RefreshCw,
  Search,
  GitCompare,
  Bookmark,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  Activity,
  Code2,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { apiService } from '../services/api';
import { DeveloperProfile, RepositorySummary } from '../types';
import { usePin } from '../context/PinContext';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { isPinned, togglePin } = usePin();
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Repository explorer filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState<'stars' | 'pushed' | 'forks' | 'name'>('stars');

  const fetchProfile = async (refresh = false) => {
    if (!username) return;

    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await apiService.getDeveloper(username, refresh);
      setProfile(data);
    } catch (err: any) {
      setError(err.message || `Failed to fetch profile for @${username}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile(false);
    setSearchQuery('');
    setSelectedLanguage('all');
  }, [username]);

  // Unique languages extracted from repositories for filter dropdown
  const availableLanguages = useMemo(() => {
    if (!profile) return [];
    const langs = new Set<string>();
    profile.repositories.forEach((r) => {
      if (r.primaryLanguage) langs.add(r.primaryLanguage);
    });
    return Array.from(langs).sort();
  }, [profile]);

  // Filtered and sorted repositories
  const filteredRepositories = useMemo(() => {
    if (!profile) return [];

    let list = [...profile.repositories];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) => r.name.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q))
      );
    }

    if (selectedLanguage !== 'all') {
      list = list.filter((r) => r.primaryLanguage?.toLowerCase() === selectedLanguage.toLowerCase());
    }

    list.sort((a, b) => {
      if (sortBy === 'stars') return b.stars - a.stars;
      if (sortBy === 'forks') return b.forks - a.forks;
      if (sortBy === 'pushed') {
        const timeA = a.pushedAt ? new Date(a.pushedAt).getTime() : 0;
        const timeB = b.pushedAt ? new Date(b.pushedAt).getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [profile, searchQuery, selectedLanguage, sortBy]);

  const formatRelativeTime = (isoString: string | null) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 24) return `${Math.max(1, diffHours)}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    return `${Math.floor(diffMonths / 12)}y ago`;
  };

  const handleTogglePin = async (repo: RepositorySummary) => {
    if (!profile) return;
    if (!isAuthenticated) {
      alert('Please sign in to pin repositories to your workspace.');
      return;
    }

    try {
      await togglePin({
        name: repo.name,
        fullName: repo.fullName,
        htmlUrl: repo.htmlUrl,
        developerUsername: profile.githubUsername,
        description: repo.description,
        stars: repo.stars,
        forks: repo.forks,
        primaryLanguage: repo.primaryLanguage,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to toggle pin');
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: num > 9999 ? 'compact' : 'standard' }).format(num);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 bg-slate-800 rounded" />
          <div className="h-48 bg-slate-900 border border-slate-800 rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-900 border border-slate-800 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 w-full flex-1 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Developer Not Found</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
          {error || `We couldn't retrieve GitHub activity for @${username}.`}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link to="/">
            <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Explore
            </Button>
          </Link>
          <Button variant="primary" onClick={() => fetchProfile(true)} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Retry Lookup
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Explore
        </Link>

        <div className="flex items-center gap-2.5">
          {/* Cache Status Badge */}
          <div className="text-[11px] font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${profile.isCached ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <span>{profile.isCached ? '⚡ Cached data' : '🟢 Live GitHub data'}</span>
            <span className="text-slate-600">•</span>
            <span>{formatRelativeTime(profile.fetchedAt)}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchProfile(true)}
            isLoading={refreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
            className="text-xs"
          >
            Refresh
          </Button>

          <Link to={`/compare?devs=${profile.githubUsername}`}>
            <Button variant="secondary" size="sm" leftIcon={<GitCompare className="w-3.5 h-3.5 text-blue-400" />} className="text-xs">
              Compare
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Profile Header */}
      <Card padding="lg" className="border-slate-800 bg-slate-900/90 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="shrink-0">
              <img
                src={profile.avatarUrl}
                alt={profile.name || profile.githubUsername}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-slate-700 object-cover"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {profile.name || profile.githubUsername}
                </h1>
                <a
                  href={`https://github.com/${profile.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-teal-400 hover:text-teal-300 hover:underline flex items-center gap-1"
                >
                  @{profile.githubUsername}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {profile.bio && <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">{profile.bio}</p>}

              {/* Profile Details Metadata */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-slate-400">
                {profile.company && (
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    {profile.company}
                  </span>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {profile.location}
                  </span>
                )}
                {profile.blog && (
                  <a
                    href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-teal-400 hover:underline"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                    {profile.blog.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {profile.twitterUsername && (
                  <a
                    href={`https://twitter.com/${profile.twitterUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:underline"
                  >
                    <Twitter className="w-3.5 h-3.5 text-slate-500" />
                    @{profile.twitterUsername}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card padding="md" className="border-amber-500/20 bg-slate-900/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Stars</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{formatNumber(profile.totalStars)}</div>
          <div className="text-[11px] text-amber-400/80 mt-0.5">Across all repositories</div>
        </Card>

        <Card padding="md" className="border-teal-500/20 bg-slate-900/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Public Repos</span>
            <BookOpen className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{formatNumber(profile.publicRepos)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active projects</div>
        </Card>

        <Card padding="md" className="border-blue-500/20 bg-slate-900/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Followers</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{formatNumber(profile.followers)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{formatNumber(profile.following)} following</div>
        </Card>

        <Card padding="md" className="border-purple-500/20 bg-slate-900/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Forks</span>
            <GitFork className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{formatNumber(profile.totalForks)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Community adaptations</div>
        </Card>

        <Card padding="md" className="col-span-2 lg:col-span-1 border-emerald-500/20 bg-slate-900/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Commit Velocity</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-emerald-400">{profile.commitActivity.velocityScore}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Pushed {formatRelativeTime(profile.commitActivity.lastPushedAt)}
          </div>
        </Card>
      </div>

      {/* Visual Analytics: Language Distribution */}
      <Card padding="lg" className="border-slate-800 bg-slate-900/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-teal-400" />
              Programming Language Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Aggregated code composition calculated from top repositories.
            </p>
          </div>
        </div>

        {profile.languages.length > 0 ? (
          <div>
            {/* Multi-segmented Progress Bar */}
            <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
              {profile.languages.map((lang) => (
                <div
                  key={lang.language}
                  style={{
                    width: `${Math.max(2, lang.percentage)}%`,
                    backgroundColor: lang.color || '#94a3b8',
                  }}
                  title={`${lang.language}: ${lang.percentage}%`}
                  className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
                />
              ))}
            </div>

            {/* Language Legend */}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
              {profile.languages.map((lang) => (
                <div key={lang.language} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lang.color || '#94a3b8' }} />
                  <span className="font-medium text-slate-200">{lang.language}</span>
                  <span className="text-slate-500 font-mono text-[11px]">{lang.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No language data detected.</p>
        )}
      </Card>

      {/* Repository Explorer */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-400" />
              Repositories Explorer
              <Badge variant="slate" size="sm" className="font-mono">
                {filteredRepositories.length}
              </Badge>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect stars, forks, primary languages, and recency of repositories.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search filter */}
            <div className="w-full sm:w-48">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter repos..."
                leftIcon={<Search className="w-3.5 h-3.5" />}
                className="py-1.5 text-xs bg-slate-900 border-slate-800"
              />
            </div>

            {/* Language dropdown */}
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-400"
              >
                <option value="all">All Languages</option>
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-400"
              >
                <option value="stars">Most Stars</option>
                <option value="forks">Most Forks</option>
                <option value="pushed">Recently Pushed</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Repositories Cards Grid */}
        {filteredRepositories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRepositories.map((repo) => (
              <Card
                key={repo.id}
                padding="md"
                className="border-slate-800/90 bg-slate-900/60 hover:border-slate-700 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-bold text-white hover:text-teal-400 transition-colors flex items-center gap-1.5 group break-all"
                    >
                      <span>{repo.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </a>

                    <button
                      onClick={() => handleTogglePin(repo)}
                      title={isPinned(repo.fullName) ? 'Unpin repository' : 'Pin repository to workspace'}
                      className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                        isPinned(repo.fullName)
                          ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                          : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isPinned(repo.fullName) ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {repo.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/70 text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    {repo.primaryLanguage && (
                      <span className="flex items-center gap-1.5 font-medium text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-teal-400" />
                        {repo.primaryLanguage}
                      </span>
                    )}
                    <span className="flex items-center gap-1 hover:text-amber-400 transition-colors font-mono">
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      {formatNumber(repo.stars)}
                    </span>
                    <span className="flex items-center gap-1 hover:text-blue-400 transition-colors font-mono">
                      <GitFork className="w-3.5 h-3.5 text-slate-500" />
                      {formatNumber(repo.forks)}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatRelativeTime(repo.pushedAt)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card padding="lg" className="border-dashed border-slate-800 text-center py-12">
            <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">No matching repositories found</h4>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or language filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedLanguage('all');
              }}
              className="mt-4"
            >
              Reset Filters
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
