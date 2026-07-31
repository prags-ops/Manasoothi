/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import MeditationCenter from './components/MeditationCenter';
import Journal from './components/Journal';
import Resources from './components/Resources';
import AuthModal from './components/AuthModal';
import { AuthProvider } from './context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeSection, setActiveSection] = useState('landing');

  const renderSection = () => {
    switch (activeSection) {
      case 'landing':
        return <LandingPage onNavigate={setActiveSection} />;
      case 'dashboard':
        return <Dashboard />;
      case 'meditation':
        return <MeditationCenter />;
      case 'journal':
        return <Journal />;
      case 'resources':
        return <Resources />;
      default:
        return <LandingPage onNavigate={setActiveSection} />;
    }
  };

  return (
    <AuthProvider>
      <div className="flex bg-warm-beige min-h-screen">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        
        <main className="flex-1 ml-64 min-h-screen flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>

          <footer className="p-6 text-center border-t border-stone-200/60 mt-12 bg-white/40">
            <p className="text-[11px] text-stone-400 font-semibold tracking-widest uppercase">
              &copy; 2026 Manasoothi Mental Health & Wellbeing &bull; Firebase Auth & Firestore Connected
            </p>
          </footer>
        </main>

        <AuthModal />
      </div>
    </AuthProvider>
  );
}
