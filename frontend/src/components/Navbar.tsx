import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <img src="/logo.png" alt="TaskFlow Logo" className="w-8 h-8 rounded shadow-sm mr-1 object-cover" />
        TaskFlow
      </Link>
      
      {user && (
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 hover:bg-white/5 py-1.5 px-3 rounded-full transition-colors cursor-pointer border border-transparent hover:border-border"
          >
            <div className="w-8 h-8 rounded-full bg-primary-grad flex items-center justify-center text-white font-bold shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-txprimary hidden sm:block">{user.name}</span>
            <ChevronDown size={16} className={`text-txsecondary transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] py-2 z-50 animate-slide-up origin-top-right">
              <div className="px-4 py-3 border-b border-slate-700/80 mb-2">
                <p className="text-sm font-medium text-txprimary m-0">{user.name}</p>
                <p className="text-xs text-txsecondary m-0 truncate">{user.email}</p>
              </div>
              

              <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer mt-1"
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
