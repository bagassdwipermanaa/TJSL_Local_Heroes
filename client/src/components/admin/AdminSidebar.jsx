import React from 'react';
import {
  LayoutDashboard, Users, FileText, Award, History,
  LogOut, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const ADMIN_SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
  { id: 'pendaftaran', label: 'Kelola Pendaftaran', icon: FileText },
  { id: 'users', label: 'Kelola Pengguna & Juri', icon: Users },
  { id: 'penilaian', label: 'Penilaian Juri', icon: Award },
  { id: 'audit', label: 'Audit Trail & Log', icon: History }
];

export default function AdminSidebar({
  activeMenu = 'dashboard',
  onSelectMenu,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  auditLogCount = 0
}) {
  const { user, logout } = useAuth();

  const handleItemClick = (id) => {
    onSelectMenu(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand & Toggle Header */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {isCollapsed && !isMobileOpen ? (
              <img
                src="/logos/pln.svg"
                alt="PLN"
                className="h-8 w-8 object-contain shrink-0 mx-auto"
                title="PLN Electricity Services"
              />
            ) : (
              <img
                src="/logos/logo.plnes.white.webp"
                alt="PLN Electricity Services"
                className="h-8 w-auto max-w-[170px] object-contain shrink-0"
              />
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 border-b border-slate-800/60">
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 ${isCollapsed && !isMobileOpen ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
              {user?.nama ? user.nama.charAt(0).toUpperCase() : 'A'}
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-white truncate">{user?.nama || 'Administrator'}</span>
                <span className="text-[10px] text-amber-400 font-medium capitalize truncate">Super Admin</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          {ADMIN_SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                } ${isCollapsed && !isMobileOpen ? 'justify-center' : ''}`}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {(!isCollapsed || isMobileOpen) && item.id === 'audit' && auditLogCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-cyan-300">
                    {auditLogCount > 99 ? '99+' : auditLogCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors ${
              isCollapsed && !isMobileOpen ? 'justify-center' : ''
            }`}
            title="Keluar dari Akun"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span className="truncate">Keluar Sesi</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
