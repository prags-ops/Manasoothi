import { Plus, Save, Trash2, Edit2, Sparkles, Tag, Search, BookOpen, X, Check, Database, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  sentiment?: string;
  userId?: string;
}

export default function Journal() {
  const { user, openAuthModal } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('Peaceful');
  const [tagInput, setTagInput] = useState('Reflection');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [isFirestoreSource, setIsFirestoreSource] = useState(false);

  const fetchJournalEntries = async () => {
    // If user logged in, fetch from Firestore
    if (user) {
      try {
        const journalRef = collection(db, 'journal');
        const q = query(
          journalRef, 
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const firestoreEntries: JournalEntry[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          firestoreEntries.push({
            id: docSnap.id,
            date: data.date || new Date().toISOString().split('T')[0],
            title: data.title || '',
            content: data.content || '',
            mood: data.mood || 'Peaceful',
            tags: data.tags || ['General'],
            sentiment: data.sentiment || 'Reflective',
            userId: data.userId
          });
        });

        // Filter search & tag on client side
        let filtered = firestoreEntries;
        if (searchQuery) {
          const qStr = searchQuery.toLowerCase();
          filtered = filtered.filter(e => e.title.toLowerCase().includes(qStr) || e.content.toLowerCase().includes(qStr));
        }
        if (selectedTag) {
          filtered = filtered.filter(e => e.tags.map(t => t.toLowerCase()).includes(selectedTag.toLowerCase()));
        }

        setEntries(filtered);
        setIsFirestoreSource(true);
        return;
      } catch (err) {
        console.error('Error fetching Firestore journal entries, falling back to REST:', err);
      }
    }

    // Fallback to Express REST API endpoint
    try {
      let url = '/api/journal?';
      if (searchQuery) url += `query=${encodeURIComponent(searchQuery)}&`;
      if (selectedTag) url += `tag=${encodeURIComponent(selectedTag)}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setEntries(data);
        setIsFirestoreSource(false);
      }
    } catch (err) {
      console.error('Error fetching REST journal entries:', err);
    }
  };

  useEffect(() => {
    fetchJournalEntries();
  }, [user, searchQuery, selectedTag]);

  const handleFetchAiPrompt = async () => {
    try {
      const res = await fetch('/api/ai/journal-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: title || 'finding peace and gratitude' })
      });
      const data = await res.json();
      if (data.prompt) setPromptText(data.prompt);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEntry = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    const tagsArray = tagInput.split(',').map((t) => t.trim()).filter(Boolean);

    try {
      if (user) {
        // Save to Firestore Database
        if (editingId) {
          const docRef = doc(db, 'journal', editingId);
          await updateDoc(docRef, {
            title,
            content,
            mood,
            tags: tagsArray,
            updatedAt: serverTimestamp()
          });
        } else {
          await addDoc(collection(db, 'journal'), {
            userId: user.uid,
            title,
            content,
            mood,
            tags: tagsArray,
            date: new Date().toISOString().split('T')[0],
            sentiment: content.length > 50 ? 'Reflective' : 'Neutral',
            createdAt: serverTimestamp()
          });
        }
      } else {
        // Save to REST API server
        if (editingId) {
          await fetch(`/api/journal/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, mood, tags: tagsArray })
          });
        } else {
          await fetch('/api/journal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, mood, tags: tagsArray })
          });
        }
      }

      // Reset Form
      setTitle('');
      setContent('');
      setEditingId(null);
      setPromptText('');
      await fetchJournalEntries();
    } catch (err) {
      console.error('Failed to save journal entry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood);
    setTagInput(entry.tags.join(', '));
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return;
    try {
      if (user && isFirestoreSource) {
        await deleteDoc(doc(db, 'journal', id));
      } else {
        await fetch(`/api/journal/${id}`, { method: 'DELETE' });
      }
      await fetchJournalEntries();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-4xl font-serif font-bold text-stone-900">Daily Reflection Journal</h2>
            {isFirestoreSource ? (
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                <Database size={12} /> Firestore Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Demo REST API Mode
              </span>
            )}
          </div>
          <p className="text-stone-500 text-sm">
            {user
              ? `Logged in as ${user.email}. Your reflections are stored securely in Firestore.`
              : 'Write freely or sign in to save reflections across sessions in Firestore.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!user && (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-2 bg-stone-900 text-white px-4 py-3 rounded-2xl font-bold text-xs hover:bg-black transition-colors shrink-0"
            >
              <Lock size={14} /> Log In to Save
            </button>
          )}

          <button
            onClick={handleFetchAiPrompt}
            className="flex items-center gap-2 bg-soft-olive text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-xs hover:opacity-95 transition-opacity shrink-0"
          >
            <Sparkles size={16} /> Get AI Prompt
          </button>
        </div>
      </header>

      {/* AI Prompt Banner if present */}
      <AnimatePresence>
        {promptText && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-emerald-900 flex items-start justify-between gap-4"
          >
            <div className="flex gap-3 items-start">
              <Sparkles size={18} className="text-emerald-600 mt-1 shrink-0" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">AI Writing Inspiration</span>
                <p className="text-sm font-serif italic font-medium leading-relaxed">"{promptText}"</p>
              </div>
            </div>
            <button
              onClick={() => setPromptText('')}
              className="text-emerald-700 hover:text-emerald-950 p-1"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSaveEntry} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-stone-200/80 shadow-xs space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <h3 className="text-xl font-serif font-bold text-stone-900">
                {editingId ? 'Edit Reflection Entry' : 'Write New Reflection'}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setTitle('');
                    setContent('');
                  }}
                  className="text-xs text-stone-400 hover:text-stone-700 underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title of your entry..."
                className="w-full bg-warm-beige/40 border border-stone-200/80 rounded-2xl p-4 text-stone-900 font-serif font-bold text-lg focus:outline-none focus:border-soft-olive"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Mood State</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full bg-warm-beige/40 border border-stone-200/80 rounded-2xl p-3.5 text-stone-800 text-sm focus:outline-none focus:border-soft-olive"
                >
                  <option value="Peaceful">Peaceful 😌</option>
                  <option value="Happy">Happy 😊</option>
                  <option value="Productive">Productive ✨</option>
                  <option value="Anxious">Anxious 😰</option>
                  <option value="Sad">Sad 😔</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g. Work, Gratitude, Calm"
                  className="w-full bg-warm-beige/40 border border-stone-200/80 rounded-2xl p-3.5 text-stone-800 text-sm focus:outline-none focus:border-soft-olive"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Journal Body</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="Express your feelings and thoughts here..."
                className="w-full bg-warm-beige/40 border border-stone-200/80 rounded-2xl p-4 text-stone-800 font-sans text-sm leading-relaxed focus:outline-none focus:border-soft-olive"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-black text-white py-4 rounded-2xl font-bold text-sm shadow-md transition-all"
            >
              <Save size={18} />
              {editingId 
                ? 'Update Journal Entry' 
                : user 
                  ? 'Save to Firestore Database' 
                  : 'Save Entry (Demo REST API)'}
            </button>
          </form>
        </div>

        {/* Entries Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-stone-200/80 shadow-xs space-y-4">
            <h4 className="font-serif font-bold text-stone-900 text-lg">Filter Entries</h4>

            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search entries..."
                className="w-full bg-warm-beige/40 border border-stone-200/70 rounded-xl pl-10 pr-3 py-2 text-xs focus:outline-none focus:border-soft-olive"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['All', 'Reflection', 'Calm', 'Work', 'Gratitude'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTag(t === 'All' ? null : t)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                    (t === 'All' && !selectedTag) || selectedTag === t
                      ? 'bg-soft-olive text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-serif font-bold text-stone-900 text-lg px-2">Saved Entries ({entries.length})</h4>

            {entries.length === 0 ? (
              <p className="text-xs text-stone-400 italic p-4">No entries found matching filters.</p>
            ) : (
              entries.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-[1.75rem] border border-stone-200/80 shadow-xs hover:border-soft-olive/40 transition-all space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">{item.date}</span>
                      <h5 className="font-serif font-bold text-stone-900 text-base">{item.title}</h5>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="p-1.5 text-stone-400 hover:text-soft-olive rounded-lg hover:bg-stone-100"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">{item.content}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-soft-olive/10 text-soft-olive rounded-md">
                      {item.mood}
                    </span>
                    <div className="flex gap-1">
                      {item.tags.map((t) => (
                        <span key={t} className="text-[10px] text-stone-400 font-medium">#{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
