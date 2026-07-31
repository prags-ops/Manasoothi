import { Play, Pause, Timer, Music, Waves, Wind, Bird, Volume2, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

export default function MeditationCenter() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 min default
  const [totalMeditated, setTotalMeditated] = useState(145);
  const [activeSoundscape, setActiveSoundscape] = useState<string | null>(null);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying && timerSeconds > 0) {
      timer = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isPlaying) {
      setIsPlaying(false);
      handleCompleteSession(10);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timerSeconds]);

  const handleCompleteSession = async (minutes: number) => {
    try {
      const res = await fetch('/api/meditations/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes })
      });
      const data = await res.json();
      if (data.updatedStats) {
        setTotalMeditated(data.updatedStats.totalMeditationMinutes);
      }
    } catch (err) {
      console.error('Failed to record meditation:', err);
    }
  };

  const sessions = [
    { id: '1', title: 'Inner Calm & Stillness', instructor: 'Dr. Sarah J.', duration: '10 min', sec: 600, icon: Waves, color: 'bg-blue-50 text-blue-600' },
    { id: '2', title: 'Deep Restorative Sleep', instructor: 'Marcus Aurel', duration: '20 min', sec: 1200, icon: Wind, color: 'bg-indigo-50 text-indigo-600' },
    { id: '3', title: 'Mindful Focus Reset', instructor: 'Zen Master Li', duration: '5 min', sec: 300, icon: Bird, color: 'bg-emerald-50 text-emerald-600' },
    { id: '4', title: 'Anxiety Release', instructor: 'Elena Rae', duration: '15 min', sec: 900, icon: Music, color: 'bg-rose-50 text-rose-600' },
  ];

  const soundscapes = [
    { title: 'Gentle Rain', desc: 'Soothing rainfall on leaves' },
    { title: 'Ocean Waves', desc: 'Rhythmic tide rolling' },
    { title: 'Night Campfire', desc: 'Soft crackling ember warm' },
    { title: 'Forest Chords', desc: 'Morning birdsong ambience' }
  ];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-serif font-bold text-stone-900 mb-2">Mindfulness Practice</h2>
          <p className="text-stone-500 text-sm">Guided meditation sessions, breathwork, and ambient audio environments.</p>
        </div>

        <div className="bg-white px-5 py-3 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 bg-soft-olive/10 text-soft-olive rounded-xl flex items-center justify-center font-bold">
            <Timer size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Total Practice</span>
            <span className="text-sm font-semibold text-stone-900">{totalMeditated} Minutes</span>
          </div>
        </div>
      </header>

      {/* Active Meditation Player Banner */}
      <div className="bg-soft-olive p-8 md:p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-2 block">
            {activeSessionId ? 'Current Session' : 'Featured Daily Practice'}
          </span>
          <h3 className="text-3xl font-serif font-bold mb-3">
            {activeSessionId
              ? sessions.find((s) => s.id === activeSessionId)?.title
              : 'Mountain Stillness: Grounding Meditation'}
          </h3>
          <p className="text-emerald-100/80 text-sm mb-6">
            Release physical tension and gently anchor your awareness in the present moment.
          </p>

          <div className="flex items-center gap-6">
            <div className="text-3xl font-serif font-bold tracking-tight font-mono">
              {formatTime(timerSeconds)}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2 bg-white text-soft-olive hover:bg-emerald-50 px-6 py-3 rounded-2xl font-bold text-sm transition-transform active:scale-95"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                {isPlaying ? 'Pause' : 'Start Session'}
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setTimerSeconds(600);
                }}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-colors"
                title="Reset Timer"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Guided Audio Sessions */}
      <section space-y-6>
        <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6">Guided Audio Sessions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((session) => {
            const isSelected = activeSessionId === session.id;
            const Icon = session.icon;
            return (
              <motion.div
                key={session.id}
                whileHover={{ y: -3 }}
                className={`p-6 rounded-[2rem] border transition-all flex items-center gap-5 ${
                  isSelected
                    ? 'bg-white border-soft-olive shadow-sm ring-2 ring-soft-olive/20'
                    : 'bg-white border-stone-200/70 hover:border-stone-300'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl ${session.color} flex items-center justify-center shrink-0`}>
                  <Icon size={24} />
                </div>

                <div className="flex-1">
                  <h4 className="text-lg font-serif font-bold text-stone-900">{session.title}</h4>
                  <p className="text-stone-400 text-xs italic">Guide: {session.instructor}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-stone-500">
                    <span className="flex items-center gap-1">
                      <Timer size={12} /> {session.duration}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveSessionId(session.id);
                    setTimerSeconds(session.sec);
                    setIsPlaying(true);
                  }}
                  className="w-11 h-11 rounded-2xl bg-stone-900 text-white flex items-center justify-center hover:bg-black transition-colors"
                >
                  <Play size={16} fill="currentColor" className="ml-0.5" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Ambient Soundscapes */}
      <section>
        <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6">Ambient Soundscapes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {soundscapes.map((sound) => {
            const isActive = activeSoundscape === sound.title;
            return (
              <button
                key={sound.title}
                onClick={() => setActiveSoundscape(isActive ? null : sound.title)}
                className={`p-6 rounded-[2rem] border text-left transition-all ${
                  isActive
                    ? 'bg-soft-olive text-white border-soft-olive shadow-sm'
                    : 'bg-white border-stone-200/70 hover:bg-stone-50 text-stone-800'
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <Volume2 size={20} className={isActive ? 'text-emerald-200' : 'text-stone-400'} />
                  {isActive && <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">Playing</span>}
                </div>
                <h4 className="font-serif font-bold text-lg mb-1">{sound.title}</h4>
                <p className={`text-xs ${isActive ? 'text-emerald-100' : 'text-stone-400'}`}>{sound.desc}</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
