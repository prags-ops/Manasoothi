import { ExternalLink, Bookmark, Search, Book, Video, Headphones, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, MouseEvent } from 'react';

interface ResourceItem {
  id: string;
  title: string;
  author: string;
  category: string;
  tags: string[];
  readTime: string;
  summary: string;
  image: string;
  content: string;
}

export default function Resources() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<ResourceItem | null>(null);

  const categories = [
    { label: 'All', icon: Book },
    { label: 'Articles', icon: Book },
    { label: 'Podcasts', icon: Headphones },
    { label: 'Videos', icon: Video },
  ];

  const fetchResources = async () => {
    try {
      let url = '/api/resources?';
      if (selectedCategory !== 'All') url += `category=${encodeURIComponent(selectedCategory)}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.resources) {
        setResources(data.resources);
      }
      if (data.bookmarkedIds) {
        setBookmarkedIds(data.bookmarkedIds);
      }
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedCategory, searchQuery]);

  const toggleBookmark = async (resourceId: string, e: MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/resources/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId })
      });
      const data = await res.json();
      if (data.bookmarkedIds) {
        setBookmarkedIds(data.bookmarkedIds);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-serif font-bold text-stone-900 mb-2">Mental Health Resource Hub</h2>
          <p className="text-stone-500 text-sm">Evidence-based insights, mental wellness guides, and expert podcasts.</p>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, topics, or authors..."
            className="w-full bg-white border border-stone-200/80 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-soft-olive shadow-xs"
          />
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-stone-200/80 shadow-xs">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-soft-olive text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Icon size={14} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {resources.map((res) => {
          const isBookmarked = bookmarkedIds.includes(res.id);
          return (
            <motion.div
              key={res.id}
              whileHover={{ y: -4 }}
              onClick={() => setActiveArticle(res)}
              className="bg-white rounded-[2.5rem] border border-stone-200/80 shadow-xs overflow-hidden cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={res.image}
                    alt={res.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => toggleBookmark(res.id, e)}
                    className={`absolute top-4 right-4 p-2.5 rounded-xl transition-all ${
                      isBookmarked
                        ? 'bg-soft-olive text-white'
                        : 'bg-white/90 text-stone-700 hover:bg-white'
                    }`}
                  >
                    <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-soft-olive bg-soft-olive/10 px-2.5 py-0.5 rounded-md">
                      {res.category}
                    </span>
                    <span className="text-[11px] text-stone-400 flex items-center gap-1 font-medium">
                      <Clock size={12} /> {res.readTime}
                    </span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-stone-900 group-hover:text-soft-olive transition-colors mb-2">
                    {res.title}
                  </h3>
                  <p className="text-stone-500 text-xs leading-relaxed line-clamp-2">{res.summary}</p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-0 flex justify-between items-center text-xs text-stone-400 border-t border-stone-100 mt-2">
                <span className="italic font-medium">By {res.author}</span>
                <span className="font-bold text-soft-olive flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Read Full <ExternalLink size={12} />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detail Article Modal */}
      <AnimatePresence>
        {activeArticle && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 shadow-2xl relative space-y-6"
            >
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-6 right-6 p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-600 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-soft-olive bg-soft-olive/10 px-3 py-1 rounded-md">
                  {activeArticle.category}
                </span>
                <h3 className="text-3xl font-serif font-bold text-stone-900">{activeArticle.title}</h3>
                <p className="text-xs text-stone-400 italic">By {activeArticle.author} &bull; {activeArticle.readTime}</p>
              </div>

              <img
                src={activeArticle.image}
                alt={activeArticle.title}
                className="w-full h-56 object-cover rounded-2xl"
              />

              <div className="prose prose-stone text-sm leading-relaxed text-stone-700 font-serif">
                <p>{activeArticle.content}</p>
                <p className="mt-4 text-stone-500">
                  Practicing mental mindfulness daily helps strengthen emotional resilience. Explore further reflections or record your thoughts in your Daily Journal.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <button
                  onClick={() => setActiveArticle(null)}
                  className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-black"
                >
                  Close Resource
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
