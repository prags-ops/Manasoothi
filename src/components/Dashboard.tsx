import { Heart, Sun, Moon, Zap, TrendingUp, Calendar, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [moodLogs, setMoodLogs] = useState<any[]>([]);
  const [avgScore, setAvgScore] = useState<string>('4.2');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string>('Loading daily inspiration...');

  const moods = [
    { label: 'Peaceful', emoji: '😌', score: 5 },
    { label: 'Happy', emoji: '😊', score: 4 },
    { label: 'Productive', emoji: '✨', score: 4 },
    { label: 'Anxious', emoji: '😰', score: 2 },
    { label: 'Sad', emoji: '😔', score: 2 },
  ];

  const fetchMoods = async () => {
    try {
      const res = await fetch('/api/moods');
      const data = await res.json();
      if (data.logs) {
        setMoodLogs(data.logs);
      }
      if (data.stats) {
        setAvgScore(data.stats.averageScore);
      }
    } catch (err) {
      console.error('Error fetching moods:', err);
    }
  };

  const fetchAiPrompt = async () => {
    try {
      const res = await fetch('/api/ai/journal-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'mindful morning reflection' })
      });
      const data = await res.json();
      if (data.prompt) setAiPrompt(data.prompt);
    } catch (err) {
      setAiPrompt("What is one small thing that brought you peace or comfort today?");
    }
  };

  useEffect(() => {
    fetchMoods();
    fetchAiPrompt();
  }, []);

  const handleLogMood = async (moodItem: typeof moods[0]) => {
    setSelectedMood(moodItem.label);
    setIsSubmitting(true);
    try {
      await fetch('/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: moodItem.label,
          emoji: moodItem.emoji,
          score: moodItem.score
        })
      });
      await fetchMoods();
    } catch (err) {
      console.error('Error logging mood:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200/60">
        <div>
          <div className="flex items-center gap-2 text-soft-olive mb-1 text-xs font-semibold uppercase tracking-wider">
            <Calendar size={14} />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">Good morning, Pragati</h2>
          <p className="text-stone-500 text-sm mt-1">Here is your mental health overview for today.</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            {avgScore}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Weekly Score</span>
            <span className="text-xs font-semibold text-stone-800">Peaceful & Balanced</span>
          </div>
        </div>
      </header>

      {/* Mood Entry Bar */}
      <section className="bg-white p-6 md:p-8 rounded-[2rem] border border-stone-200/80 shadow-xs">
        <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">How are you feeling right now?</h3>
        <p className="text-stone-500 text-xs mb-6">Select a mood to log to your back-end database.</p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4">
          {moods.map((mood) => {
            const isSelected = selectedMood === mood.label;
            return (
              <button
                key={mood.label}
                onClick={() => handleLogMood(mood)}
                disabled={isSubmitting}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-soft-olive/10 border-soft-olive text-soft-olive font-semibold shadow-xs'
                    : 'bg-warm-beige/50 border-stone-200/60 text-stone-700 hover:bg-white hover:border-stone-300'
                }`}
              >
                <span className="text-3xl mb-2">{mood.emoji}</span>
                <span className="text-xs font-medium">{mood.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Analytics & Inspiration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Weekly Wellbeing Chart */}
          <section className="bg-white p-6 md:p-8 rounded-[2rem] border border-stone-200/80 shadow-xs">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900">Wellbeing Trends</h3>
                <p className="text-xs text-stone-400">7-day mood score history</p>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-semibold">
                <TrendingUp size={14} />
                +12% stability
              </div>
            </div>

            <div className="h-44 flex items-end gap-3 justify-between pt-4 px-2">
              {[4, 5, 4, 2, 5, 4, 3].map((score, i) => {
                const heightPct = (score / 5) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-stone-100 rounded-t-xl overflow-hidden h-32 flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className={`w-full ${
                          i === 6 ? 'bg-soft-olive' : 'bg-stone-300 group-hover:bg-soft-olive/60'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* AI Inspiration Card */}
          <section className="bg-calm-teal text-white p-8 rounded-[2rem] relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-200 flex items-center gap-1.5">
                <Sparkles size={14} />
                AI Reflection Prompt
              </span>
              <button
                onClick={fetchAiPrompt}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                title="Generate New Prompt"
              >
                <RefreshCw size={14} />
              </button>
            </div>
            <p className="text-xl font-serif italic font-medium leading-relaxed mb-4">
              "{aiPrompt}"
            </p>
            <span className="text-xs text-stone-200">Powered by Gemini AI via REST API Proxy</span>
          </section>
        </div>

        {/* Daily Tasks / Today's Routine */}
        <section className="bg-white p-6 md:p-8 rounded-[2rem] border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-6">Today's Routine</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-stone-800">Morning Meditation</h4>
                  <p className="text-[11px] text-stone-500">10 mins &bull; Completed</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-warm-beige/60 rounded-2xl border border-stone-200/60">
                <Heart size={18} className="text-rose-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-stone-800">Daily Gratitude Journal</h4>
                  <p className="text-[11px] text-stone-500">Write 3 good moments</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-warm-beige/60 rounded-2xl border border-stone-200/60">
                <Moon size={18} className="text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-stone-800">Evening Unwind</h4>
                  <p className="text-[11px] text-stone-500">15 mins soundscape</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-soft-olive/10 rounded-2xl text-center">
            <span className="text-xs font-bold text-soft-olive block mb-1">Weekly Streak</span>
            <span className="text-2xl font-serif font-bold text-stone-900">7 Days 🔥</span>
          </div>
        </section>
      </div>
    </div>
  );
}
