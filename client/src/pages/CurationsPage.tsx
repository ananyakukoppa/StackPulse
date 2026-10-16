import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  GitCompare,
  Search,
  Star,
  GitFork,
  ExternalLink,
  Trash2,
  Edit2,
  Check,
  X,
  Plus,
  LogIn,
  UserPlus,
  BookOpen,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import { usePin } from '../context/PinContext';
import { apiService } from '../services/api';
import { PinItem, SavedComparison } from '../types';

export const CurationsPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { refreshPinned } = usePin();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'pins' | 'comparisons'>('pins');
  const [pins, setPins] = useState<PinItem[]>([]);
  const [comparisons, setComparisons] = useState<SavedComparison[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter state for pins
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Inline note editing state
  const [editingPinId, setEditingPinId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // New tag draft state
  const [addingTagPinId, setAddingTagPinId] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState('');

  const loadData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [pinsData, comparisonsData] = await Promise.all([
        apiService.getUserPins(),
        apiService.getSavedComparisons(),
      ]);
      setPins(pinsData);
      setComparisons(comparisonsData);
    } catch (err) {
      console.error('Failed to load curation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  // Extract all unique tags across pins for filter pills
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    pins.forEach((p) => {
      p.tags.forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet).sort();
  }, [pins]);

  // Filtered pins
  const filteredPins = useMemo(() => {
    let result = [...pins];

    if (selectedTag !== 'all') {
      result = result.filter((p) => p.tags.map((t) => t.toLowerCase()).includes(selectedTag.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.repository.name.toLowerCase().includes(q) ||
          p.repository.fullName.toLowerCase().includes(q) ||
          p.repository.developerUsername.toLowerCase().includes(q) ||
          (p.note && p.note.toLowerCase().includes(q))
      );
    }

    return result;
  }, [pins, selectedTag, searchQuery]);

  const handleStartEditNote = (pin: PinItem) => {
    setEditingPinId(pin.id);
    setNoteDraft(pin.note || '');
  };

  const handleSaveNote = async (pinId: string) => {
    setSavingNote(true);
    try {
      const updated = await apiService.updatePin(pinId, { note: noteDraft.trim() || null });
      setPins((prev) => prev.map((p) => (p.id === pinId ? updated : p)));
      setEditingPinId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  const handleAddTag = async (pin: PinItem) => {
    const clean = tagDraft.trim().toLowerCase();
    if (!clean) return;

    if (pin.tags.includes(clean)) {
      setTagDraft('');
      setAddingTagPinId(null);
      return;
    }

    const newTags = [...pin.tags, clean];
    try {
      const updated = await apiService.updatePin(pin.id, { tags: newTags });
      setPins((prev) => prev.map((p) => (p.id === pin.id ? updated : p)));
      setTagDraft('');
      setAddingTagPinId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to add tag');
    }
  };

  const handleRemoveTag = async (pin: PinItem, tagToRemove: string) => {
    const newTags = pin.tags.filter((t) => t !== tagToRemove);
    try {
      const updated = await apiService.updatePin(pin.id, { tags: newTags });
      setPins((prev) => prev.map((p) => (p.id === pin.id ? updated : p)));
    } catch (err: any) {
      alert(err.message || 'Failed to remove tag');
    }
  };

  const handleDeletePin = async (pinId: string) => {
    try {
      await apiService.deletePin(pinId);
      setPins((prev) => prev.filter((p) => p.id !== pinId));
      refreshPinned();
    } catch (err: any) {
      alert(err.message || 'Failed to unpin repository');
    }
  };

  const handleDeleteComparison = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comparison?')) return;
    try {
      await apiService.deleteSavedComparison(id);
      setComparisons((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete comparison');
    }
  };

  // Unauthenticated Guard Screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 w-full flex-1 flex flex-col justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-5">
          <Bookmark className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Your Private Curations</h2>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Sign in to pin standout repositories, write personal notes, organize custom tags, and revisit saved developer comparisons.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full" leftIcon={<LogIn className="w-4 h-4" />}>
              Sign In
            </Button>
          </Link>
          <Link to="/register" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full" leftIcon={<UserPlus className="w-4 h-4" />}>
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-teal-400" />
            Personal Curations & Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Private workspace for {user?.name || user?.email}. Pinned repositories and notes are private to your account.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('pins')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'pins'
                ? 'bg-teal-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Pinned Repos ({pins.length})
          </button>
          <button
            onClick={() => setActiveTab('comparisons')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'comparisons'
                ? 'bg-teal-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            Saved Comparisons ({comparisons.length})
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-16 text-center text-slate-400 text-xs">
          Loading your curations...
        </div>
      )}

      {/* TAB 1: Pinned Repositories */}
      {!loading && activeTab === 'pins' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="w-full sm:w-64">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pins, notes, or tags..."
                leftIcon={<Search className="w-3.5 h-3.5" />}
                className="py-1.5 text-xs bg-slate-900 border-slate-800"
              />
            </div>

            {/* Tag Filter Pills */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setSelectedTag('all')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                    selectedTag === 'all'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  All ({pins.length})
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                      selectedTag === tag
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pins Grid */}
          {filteredPins.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPins.map((pin) => (
                <Card
                  key={pin.id}
                  padding="md"
                  className="border-slate-800 bg-slate-900/70 hover:border-slate-700 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Title + Unpin */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <a
                          href={pin.repository.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-bold text-white hover:text-teal-400 inline-flex items-center gap-1.5"
                        >
                          <span>{pin.repository.fullName}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                        <div className="text-xs text-slate-400 mt-0.5 font-mono">
                          by{' '}
                          <Link to={`/profile/${pin.repository.developerUsername}`} className="hover:underline text-teal-400">
                            @{pin.repository.developerUsername}
                          </Link>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeletePin(pin.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
                        title="Remove pin"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {pin.repository.description && (
                      <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                        {pin.repository.description}
                      </p>
                    )}

                    {/* Tags Section */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {pin.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-950 border border-slate-800 text-teal-300"
                        >
                          #{tag}
                          <button
                            onClick={() => handleRemoveTag(pin, tag)}
                            className="text-slate-500 hover:text-rose-400"
                            title="Remove tag"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}

                      {addingTagPinId === pin.id ? (
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="text"
                            value={tagDraft}
                            onChange={(e) => setTagDraft(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTag(pin)}
                            placeholder="tag name..."
                            autoFocus
                            className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-slate-200 font-mono w-20 focus:outline-none focus:ring-1 focus:ring-teal-400"
                          />
                          <button
                            onClick={() => handleAddTag(pin)}
                            className="text-teal-400 hover:text-teal-300"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              setAddingTagPinId(null);
                              setTagDraft('');
                            }}
                            className="text-slate-500 hover:text-slate-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setAddingTagPinId(pin.id);
                            setTagDraft('');
                          }}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60"
                        >
                          <Plus className="w-2.5 h-2.5" /> Tag
                        </button>
                      )}
                    </div>

                    {/* Private Note Section */}
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs mb-3">
                      {editingPinId === pin.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            placeholder="Add your private note regarding this repository..."
                            rows={2}
                            autoFocus
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-400"
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingPinId(null)}
                              className="px-2 py-0.5 text-xs"
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleSaveNote(pin.id)}
                              isLoading={savingNote}
                              className="px-2.5 py-0.5 text-xs"
                            >
                              Save Note
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <p className={`leading-relaxed ${pin.note ? 'text-slate-300 italic' : 'text-slate-600 italic'}`}>
                            {pin.note ? `"${pin.note}"` : 'No private notes yet.'}
                          </p>
                          <button
                            onClick={() => handleStartEditNote(pin)}
                            className="text-slate-500 hover:text-teal-400 p-0.5 shrink-0"
                            title="Edit note"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Metrics */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                    <div className="flex items-center gap-3">
                      {pin.repository.primaryLanguage && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <span className="w-2 h-2 rounded-full bg-teal-400" />
                          {pin.repository.primaryLanguage}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3 h-3" />
                        {pin.repository.stars}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <GitFork className="w-3 h-3" />
                        {pin.repository.forks}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500">
                      Pinned {new Date(pin.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card padding="lg" className="border-dashed border-slate-800 text-center py-16">
              <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-300">No Pinned Repositories Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery || selectedTag !== 'all'
                  ? 'No repositories match your active search or tag filter.'
                  : 'You have not pinned any repositories yet. Explore developer profiles to bookmark notable projects.'}
              </p>
              <div className="mt-4">
                <Link to="/">
                  <Button variant="outline" size="sm" className="text-xs">
                    Explore Developers
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: Saved Comparisons */}
      {!loading && activeTab === 'comparisons' && (
        <div className="space-y-4">
          {comparisons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comparisons.map((c) => (
                <Card
                  key={c.id}
                  padding="md"
                  className="border-slate-800 bg-slate-900/70 hover:border-slate-700 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-white">{c.name}</h3>
                      <button
                        onClick={() => handleDeleteComparison(c.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-md transition-colors"
                        title="Delete comparison"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {c.description && (
                      <p className="text-xs text-slate-400 mb-3">{c.description}</p>
                    )}

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {c.developerUsernames.map((u) => (
                        <span
                          key={u}
                          className="px-2 py-0.5 rounded text-xs font-mono bg-slate-950 border border-slate-800 text-teal-300"
                        >
                          @{u}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-500">
                      Saved {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/compare?devs=${c.developerUsernames.join(',')}`)}
                      leftIcon={<GitCompare className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Open Comparison
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card padding="lg" className="border-dashed border-slate-800 text-center py-16">
              <GitCompare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-300">No Saved Comparisons</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Compare two or more GitHub developers and click &quot;Save Comparison&quot; to bookmark your head-to-head analysis here.
              </p>
              <div className="mt-4">
                <Link to="/compare">
                  <Button variant="outline" size="sm" className="text-xs">
                    Start a Comparison
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default CurationsPage;
