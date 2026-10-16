import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  GitCompare,
  Plus,
  X,
  Star,
  GitFork,
  BookOpen,
  Users,
  Activity,
  Bookmark,
  Trash2,
  ExternalLink,
  Save,
  Check,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { apiService } from '../services/api';
import { ComparisonMatrix, SavedComparison } from '../types';
import { useAuth } from '../context/AuthContext';

export const ComparePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [devUsernames, setDevUsernames] = useState<string[]>(() => {
    const devsParam = searchParams.get('devs');
    if (devsParam) {
      return devsParam.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    }
    return ['torvalds', 'gaearon'];
  });

  const [newDevInput, setNewDevInput] = useState('');
  const [matrix, setMatrix] = useState<ComparisonMatrix | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save comparison state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Saved comparisons list
  const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [showSavedList, setShowSavedList] = useState(false);

  const fetchMatrix = async (usernames: string[]) => {
    if (usernames.length < 2) {
      setError('Please select at least 2 developers to compare.');
      setMatrix(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getComparisonMatrix(usernames);
      setMatrix(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate comparison matrix');
      setMatrix(null);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedComparisons = async () => {
    if (!isAuthenticated) return;
    setLoadingSaved(true);
    try {
      const list = await apiService.getSavedComparisons();
      setSavedComparisons(list);
    } catch {
      // Ignore if unauthenticated
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    fetchMatrix(devUsernames);
    setSearchParams({ devs: devUsernames.join(',') });
  }, [devUsernames]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSavedComparisons();
    }
  }, [isAuthenticated]);

  const handleAddDeveloper = (e: React.FormEvent) => {
    e.preventDefault();
    const candidate = newDevInput.trim().toLowerCase();
    if (!candidate) return;

    if (devUsernames.includes(candidate)) {
      setNewDevInput('');
      return;
    }

    if (devUsernames.length >= 5) {
      alert('You can compare a maximum of 5 developers at once.');
      return;
    }

    setDevUsernames([...devUsernames, candidate]);
    setNewDevInput('');
  };

  const handleRemoveDeveloper = (username: string) => {
    if (devUsernames.length <= 2) {
      alert('A comparison requires at least 2 developers.');
      return;
    }
    setDevUsernames(devUsernames.filter((u) => u !== username));
  };

  const handleApplyPreset = (usernames: string[]) => {
    setDevUsernames(usernames);
  };

  const handleSaveComparison = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim()) return;

    setSaving(true);
    try {
      await apiService.saveComparison({
        name: saveName.trim(),
        description: saveDescription.trim() || undefined,
        developers: devUsernames,
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowSaveModal(false);
        setSaveName('');
        setSaveDescription('');
      }, 1500);
      loadSavedComparisons();
    } catch (err: any) {
      alert(err.message || 'Failed to save comparison');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSavedComparison = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved comparison?')) return;
    try {
      await apiService.deleteSavedComparison(id);
      setSavedComparisons((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete comparison');
    }
  };

  const handleLoadSaved = (c: SavedComparison) => {
    setDevUsernames(c.developerUsernames);
    setShowSavedList(false);
  };

  // Find maximum star count for relative bar visualization
  const maxStars = useMemo(() => {
    if (!matrix || matrix.items.length === 0) return 1;
    return Math.max(...matrix.items.map((i) => i.developer.totalStars), 1);
  }, [matrix]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: num > 9999 ? 'compact' : 'standard' }).format(num);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-teal-400" />
              Developer Comparison Matrix
            </h1>
            <Badge variant="teal" size="sm">
              {devUsernames.length} Developers
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Head-to-head metric benchmarking across total stars, repositories, language share, and commit velocity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAuthenticated && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSavedList(!showSavedList)}
                leftIcon={<FolderOpen className="w-4 h-4 text-slate-400" />}
                className="text-xs"
              >
                Saved ({savedComparisons.length})
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowSaveModal(true)}
                disabled={!matrix || matrix.items.length < 2}
                leftIcon={<Save className="w-4 h-4" />}
                className="text-xs"
              >
                Save Comparison
              </Button>
            </>
          )}

          {!isAuthenticated && (
            <Link to="/login">
              <Button variant="outline" size="sm" className="text-xs" leftIcon={<Bookmark className="w-3.5 h-3.5 text-slate-400" />}>
                Sign In to Save
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Saved Comparisons Drawer */}
      {showSavedList && isAuthenticated && (
        <Card padding="md" className="border-teal-500/30 bg-slate-900/90 shadow-lg">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-400">Your Saved Comparisons</h3>
            <button
              onClick={() => setShowSavedList(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {loadingSaved ? (
            <p className="text-xs text-slate-400">Loading saved comparisons...</p>
          ) : savedComparisons.length === 0 ? (
            <p className="text-xs text-slate-500">No saved comparisons yet. Click &quot;Save Comparison&quot; above to store this head-to-head view.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {savedComparisons.map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="truncate">
                    <button
                      onClick={() => handleLoadSaved(c)}
                      className="text-xs font-semibold text-white hover:text-teal-400 text-left block truncate"
                    >
                      {c.name}
                    </button>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {c.developerUsernames.map((u) => `@${u}`).join(', ')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteSavedComparison(c.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                    title="Delete saved comparison"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Developer Selector Bar & Presets */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
        {/* Selected Developers Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 mr-1">Selected:</span>
          {devUsernames.map((username) => (
            <span
              key={username}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200"
            >
              <span>@{username}</span>
              <button
                type="button"
                onClick={() => handleRemoveDeveloper(username)}
                className="text-slate-500 hover:text-rose-400 focus:outline-none"
                title="Remove from comparison"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}

          {/* Add Developer Form */}
          {devUsernames.length < 5 && (
            <form onSubmit={handleAddDeveloper} className="flex items-center gap-1.5">
              <input
                type="text"
                value={newDevInput}
                onChange={(e) => setNewDevInput(e.target.value)}
                placeholder="Add @username..."
                className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono w-32 sm:w-40"
              />
              <Button type="submit" size="sm" variant="secondary" className="px-2 py-1 text-xs">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </form>
          )}
        </div>

        {/* Quick Comparison Presets */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
          <span className="text-slate-500 hidden sm:inline">Presets:</span>
          <button
            onClick={() => handleApplyPreset(['torvalds', 'gaearon'])}
            className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 text-[11px] text-slate-300"
          >
            Linux vs React
          </button>
          <button
            onClick={() => handleApplyPreset(['gaearon', 'yyx990803', 'rich-harris'])}
            className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 text-[11px] text-slate-300"
          >
            UI Frameworks
          </button>
          <button
            onClick={() => handleApplyPreset(['shadcn', 'sindresorhus'])}
            className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 text-[11px] text-slate-300"
          >
            OSS Creators
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <Card padding="lg" className="border-slate-800 text-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-white">Aggregating Developer Metrics...</h3>
          <p className="text-xs text-slate-400 mt-1">
            Pulling GitHub activity and computing comparative benchmarks for {devUsernames.join(', ')}.
          </p>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card padding="md" className="border-rose-500/20 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <div className="flex-1">
            <span className="font-semibold block">Comparison Error</span>
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Comparison Matrix Table */}
      {matrix && !loading && (
        <div className="space-y-6">
          {/* Main Head-to-Head Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70 shadow-md">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80">
                  <th className="py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-44">
                    Metric
                  </th>
                  {matrix.items.map((item) => (
                    <th key={item.developer.githubUsername} className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={item.developer.avatarUrl}
                          alt={item.developer.name || item.developer.githubUsername}
                          className="w-14 h-14 rounded-xl border border-slate-700 object-cover"
                        />
                        <div className="text-center">
                          <Link
                            to={`/profile/${item.developer.githubUsername}`}
                            className="text-sm font-bold text-white hover:text-teal-400 block transition-colors truncate max-w-[150px]"
                          >
                            {item.developer.name || item.developer.githubUsername}
                          </Link>
                          <a
                            href={`https://github.com/${item.developer.githubUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono text-slate-400 hover:text-teal-400 inline-flex items-center gap-1"
                          >
                            @{item.developer.githubUsername}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {/* Total Stars Row */}
                <tr className="hover:bg-slate-850/40">
                  <td className="py-3 px-4 font-semibold text-slate-300 flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    Total Stars
                  </td>
                  {matrix.items.map((item) => (
                    <td key={item.developer.githubUsername} className="py-3 px-4 text-center">
                      <div className="font-mono text-sm font-bold text-white inline-flex items-center gap-1.5">
                        <span>{formatNumber(item.developer.totalStars)}</span>
                        {item.isLeaderInStars && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            Leader
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Public Repositories Row */}
                <tr className="hover:bg-slate-850/40">
                  <td className="py-3 px-4 font-semibold text-slate-300 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                    Public Repos
                  </td>
                  {matrix.items.map((item) => (
                    <td key={item.developer.githubUsername} className="py-3 px-4 text-center">
                      <div className="font-mono text-sm font-bold text-slate-200 inline-flex items-center gap-1.5">
                        <span>{formatNumber(item.developer.publicRepos)}</span>
                        {item.isLeaderInRepos && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30">
                            Leader
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Followers Row */}
                <tr className="hover:bg-slate-850/40">
                  <td className="py-3 px-4 font-semibold text-slate-300 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    Followers
                  </td>
                  {matrix.items.map((item) => (
                    <td key={item.developer.githubUsername} className="py-3 px-4 text-center">
                      <div className="font-mono text-sm text-slate-200 inline-flex items-center gap-1.5">
                        <span>{formatNumber(item.developer.followers)}</span>
                        {item.isLeaderInFollowers && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                            Leader
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Total Forks Row */}
                <tr className="hover:bg-slate-850/40">
                  <td className="py-3 px-4 font-semibold text-slate-300 flex items-center gap-2">
                    <GitFork className="w-3.5 h-3.5 text-purple-400" />
                    Total Forks
                  </td>
                  {matrix.items.map((item) => (
                    <td key={item.developer.githubUsername} className="py-3 px-4 text-center">
                      <div className="font-mono text-sm text-slate-200 inline-flex items-center gap-1.5">
                        <span>{formatNumber(item.developer.totalForks)}</span>
                        {item.isLeaderInForks && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                            Leader
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Commit Velocity Row */}
                <tr className="hover:bg-slate-850/40">
                  <td className="py-3 px-4 font-semibold text-slate-300 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    Commit Velocity
                  </td>
                  {matrix.items.map((item) => (
                    <td key={item.developer.githubUsername} className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                        {item.developer.commitActivity.velocityScore}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Primary Languages Row */}
                <tr className="hover:bg-slate-850/40">
                  <td className="py-3 px-4 font-semibold text-slate-300">
                    Top Languages
                  </td>
                  {matrix.items.map((item) => (
                    <td key={item.developer.githubUsername} className="py-3 px-4 text-center">
                      <div className="flex flex-wrap justify-center gap-1 max-w-xs mx-auto">
                        {item.developer.languages.slice(0, 3).map((l) => (
                          <span
                            key={l.language}
                            className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-300 bg-slate-950 border border-slate-800 flex items-center gap-1"
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color || '#94a3b8' }} />
                            <span>{l.language} ({l.percentage}%)</span>
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Visual Analytics: Relative Star Volume Bars */}
          <Card padding="md" className="border-slate-800 bg-slate-900/70">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              Comparative Star Volume
            </h3>
            <div className="space-y-3">
              {matrix.items.map((item) => {
                const percentage = Math.round((item.developer.totalStars / maxStars) * 100);
                return (
                  <div key={item.developer.githubUsername} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300">@{item.developer.githubUsername}</span>
                      <span className="text-amber-400 font-bold">{formatNumber(item.developer.totalStars)} stars</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(3, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Common Tech Stack Overlap */}
          {matrix.commonLanguages.length > 0 && (
            <Card padding="md" className="border-slate-800 bg-slate-900/70">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Shared Technologies
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Languages active across multiple developers in this comparison:
              </p>
              <div className="flex flex-wrap gap-2">
                {matrix.commonLanguages.map((lang) => (
                  <Badge key={lang} variant="teal" size="sm">
                    {lang}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Save Comparison Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Save className="w-4 h-4 text-teal-400" /> Save Comparison
              </h3>
              <button onClick={() => setShowSaveModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveSuccess ? (
              <div className="py-6 text-center text-teal-400 flex flex-col items-center gap-2">
                <Check className="w-8 h-8 text-teal-400" />
                <span className="font-semibold text-sm">Comparison Saved Successfully</span>
              </div>
            ) : (
              <form onSubmit={handleSaveComparison} className="space-y-4">
                <Input
                  label="Comparison Name"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="e.g. Linux vs React Architects"
                  required
                  autoFocus
                />

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Description (optional)
                  </label>
                  <textarea
                    value={saveDescription}
                    onChange={(e) => setSaveDescription(e.target.value)}
                    placeholder="Brief notes about this comparison..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  />
                </div>

                <div className="text-xs text-slate-500 font-mono">
                  Developers: {devUsernames.map((u) => `@${u}`).join(', ')}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowSaveModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" isLoading={saving}>
                    Save
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparePage;
