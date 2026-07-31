import { Home, LayoutDashboard, Compass, BookOpen, Library, HeartHandshake, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function Sidebar({ activeSection, setActiveSection }: SidebarProps) {
  const { user, openAuthModal, logout } = useAuth();

  const menuItems = [
    { id: 'landing', label: 'Welcome Home', icon: Home, badge: '' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: '' },
    { id: 'meditation', label: 'Mindfulness', icon: Compass, badge: '' },
    { id: 'journal', label: 'Daily Journal', icon: BookOpen, badge: '' },
    { id: 'resources', label: 'Resources', icon: Library, badge: '' },
  ];

  return (
    <aside className="flex flex-col h-screen w-64 bg-white border-r border-stone-200/80 py-6 px-4 fixed left-0 top-0 z-30 shadow-sm">
      <div 
        onClick={() => setActiveSection('landing')}
        className="flex items-center gap-3 px-3 mb-6 cursor-pointer group"
      >
        <div className="w-10 h-10 bg-soft-olive rounded-2xl flex items-center justify-center text-white font-serif text-2xl font-bold shadow-sm group-hover:scale-105 transition-transform">
          M
        </div>
        <div>
          <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight leading-none">Manasoothi</h1>
          <span className="text-[10px] font-sans text-stone-400 uppercase tracking-widest font-semibold">Wellbeing App</span>
        </div>
      </div>

      {/* User Auth Profile Box */}
      <div className="px-1 mb-4">
        {user ? (
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt="User Avatar" className="w-8 h-8 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-soft-olive/20 text-soft-olive flex items-center justify-center font-bold text-xs shrink-0">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="overflow-hidden text-left">
                <span className="text-xs font-bold text-stone-900 block truncate">
                  {user.displayName || 'Pragati Katiyar'}
                </span>
                <span className="text-[10px] text-stone-400 block truncate">
                  {user.email}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="w-full flex items-center justify-center gap-2 bg-soft-olive text-white py-2.5 px-3 rounded-2xl text-xs font-bold shadow-2xs hover:opacity-95 transition-all"
          >
            <LogIn size={15} /> Log In / Sign Up
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1 pr-1">
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left transition-all duration-200 ${
                isActive
                  ? 'bg-soft-olive/10 text-soft-olive font-semibold shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100/60 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={19} className={isActive ? 'text-soft-olive' : 'text-stone-400'} />
                <span className="text-sm font-sans tracking-tight">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                  isActive ? 'bg-soft-olive text-white' : 'bg-stone-100 text-stone-500'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="pt-3 border-t border-stone-100 space-y-2 mt-auto">
        <div className="p-3 bg-warm-beige rounded-2xl border border-stone-200/60 text-xs">
          <div className="flex items-center gap-2 text-stone-800 font-semibold mb-1">
            <HeartHandshake size={14} className="text-soft-olive" />
            Firestore & Auth Active
          </div>
          <p className="text-[11px] text-stone-500 leading-tight">
            Firebase project essential-altar-ftgzl connected.
          </p>
        </div>
      </div>
    </aside>
  );
}
