import { ArrowRight, Sparkles, Heart, Compass, ShieldCheck, Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface LandingPageProps {
  onNavigate: (section: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  // Box Breathing exercise state (4s Inhale, 4s Hold, 4s Exhale, 4s Hold)
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);

  useEffect(() => {
    let interval: any = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathSeconds((prev) => {
          if (prev <= 1) {
            setBreathPhase((currentPhase) => {
              if (currentPhase === 'Inhale') return 'Hold';
              if (currentPhase === 'Hold') return 'Exhale';
              if (currentPhase === 'Exhale') return 'Pause';
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathSeconds(4);
      setBreathPhase('Inhale');
    }
    return () => clearInterval(interval);
  }, [isBreathingActive]);

  const features = [
    {
      title: 'Daily Mood Tracking',
      desc: 'Log emotional reflections and view analytics on your mental wellness trends over time.',
      icon: Heart,
      section: 'dashboard',
      color: 'bg-rose-50 text-rose-600'
    },
    {
      title: 'Mindfulness & Meditation',
      desc: 'Guided audio sessions and interactive box-breathing exercises to soothe stress.',
      icon: Compass,
      section: 'meditation',
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      title: 'Private Daily Journal',
      desc: 'Record your thoughts securely with full CRUD capabilities and AI writing prompts.',
      icon: Sparkles,
      section: 'journal',
      color: 'bg-blue-50 text-blue-600'
    }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-soft-olive/15 via-white to-warm-beige p-10 md:p-14 rounded-[2.5rem] border border-stone-200/80 shadow-xs">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-soft-olive/10 text-soft-olive px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6">
            <Sparkles size={14} />
            Mental Wellbeing Companion
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 leading-tight mb-4">
            Nurture Your Mind, <br />
            <span className="italic text-soft-olive">One Moment at a Time.</span>
          </h1>
          <p className="text-stone-600 font-sans text-base leading-relaxed mb-8">
            Manasoothi provides a calm space for daily mood tracking, guided breathing exercises, private journaling, and evidence-based mental health resources.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 bg-stone-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-md hover:scale-[1.02]"
            >
              Open Dashboard <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate('meditation')}
              className="flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all"
            >
              Start Breathing Session
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Box Breathing Tool */}
      <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-stone-200/80 shadow-xs">
        <div className="text-center max-w-lg mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-soft-olive mb-2 block">Quick Relaxation</span>
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">4-7-8 Guided Breathing Reset</h2>
          <p className="text-stone-500 text-sm">Take a 1-minute pause right now to lower anxiety and clear your mind.</p>
        </div>

        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative w-48 h-48 flex items-center justify-center mb-8">
            {/* Animated Expanding Circle */}
            <motion.div
              animate={{
                scale: isBreathingActive
                  ? breathPhase === 'Inhale'
                    ? 1.35
                    : breathPhase === 'Exhale'
                    ? 0.85
                    : 1.1
                  : 1
              }}
              transition={{ duration: 3.8, ease: 'easeInOut' }}
              className={`w-40 h-40 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                breathPhase === 'Inhale'
                  ? 'bg-emerald-100 text-emerald-700'
                  : breathPhase === 'Hold'
                  ? 'bg-amber-100 text-amber-700'
                  : breathPhase === 'Exhale'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              <div className="text-center">
                <span className="text-2xl font-serif font-bold block">{isBreathingActive ? breathPhase : 'Ready'}</span>
                <span className="text-3xl font-bold font-mono">{isBreathingActive ? breathSeconds : '4s'}</span>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className="flex items-center gap-2 bg-soft-olive text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-sm hover:opacity-95 transition-opacity"
            >
              {isBreathingActive ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
              {isBreathingActive ? 'Pause Exercise' : 'Start Breathing'}
            </button>
            {isBreathingActive && (
              <button
                onClick={() => setIsBreathingActive(false)}
                className="p-3 bg-stone-100 text-stone-600 rounded-2xl hover:bg-stone-200 transition-colors"
                title="Reset"
              >
                <RotateCcw size={18} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Feature Navigation Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feat) => (
          <motion.div
            key={feat.title}
            whileHover={{ y: -4 }}
            onClick={() => onNavigate(feat.section)}
            className="p-8 bg-white rounded-[2rem] border border-stone-200/70 shadow-xs cursor-pointer hover:border-soft-olive/40 transition-all group"
          >
            <div className={`w-12 h-12 rounded-2xl ${feat.color} flex items-center justify-center mb-6`}>
              <feat.icon size={22} />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-2 group-hover:text-soft-olive transition-colors">{feat.title}</h3>
            <p className="text-stone-500 text-sm leading-relaxed mb-6">{feat.desc}</p>
            <span className="text-xs font-bold text-soft-olive flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Explore Feature <ArrowRight size={14} />
            </span>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
