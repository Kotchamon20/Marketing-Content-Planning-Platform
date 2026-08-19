import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  Layers,
  Users,
  Bell,
  Database,
  Menu,
  X,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Compass,
  Package,
  MessageSquare,
  BarChart3
} from 'lucide-react';

import LineGroupSettingsModal from './LineGroupSettingsModal';

export default function NavigationHeader({
  teams,
  activeTeamId,
  onSelectTeam,
  users,
  activeUserId,
  onSelectUser,
  activeTab,
  onSelectTab,
  notificationLogs,
  onOpenSchemaModal
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [lineSettingsOpen, setLineSettingsOpen] = useState(false);

  const activeTeam = teams.find(t => t.id === activeTeamId) || teams[0];
  const activeUser = users.find(u => u.id === activeUserId) || users[0];
  const pendingOverdueCount = notificationLogs.filter(l => l.stage === 'overdue').length;

  const tabs = [
    { id: 'dashboard', label: 'ภาพรวม Dashboard', icon: Sparkles },
    { id: 'content-plan', label: 'Module 1: Content Plan', icon: Calendar },
    { id: 'marketing-plan', label: 'Module 2: Marketing Plan', icon: Compass },
    { id: 'product-plan', label: 'Module 3: Product Plan', icon: Package },
    { id: 'kpi-analytics', label: 'Module 4: KPI Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 transition-all shadow-sm shadow-slate-900/5">
      {/* Top Banner Bar */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 py-3.5">
        <div className="flex items-center justify-between gap-4">          {/* Logo & Brand Info */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="Marketing & Content Planning Platform Logo"
              className="w-11 h-11 rounded-2xl object-cover shadow-xs border border-[#E2D2EA]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-purple-950 tracking-tight leading-none">
                  Marketing & Content Planning Platform
                </h1>
                <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFEBF3] text-purple-900 border border-[#E2D2EA]">
                  LINE OA Sync
                </span>
              </div>
              <p className="text-xs text-purple-800/80 font-medium mt-1 hidden sm:block">
                วางแผน • สร้างคอนเทนต์ • ติดตามแคมเปญสินค้า • แจ้งเตือนอัตโนมัติ
              </p>
            </div>
          </div>

          {/* Controls Right Section */}
          <div className="hidden lg:flex items-end gap-3">

            {/* SQL Schema button */}
            <button
              onClick={onOpenSchemaModal}
              className="p-2 bg-[#FCFAF7] hover:bg-[#FFEBF3]/50 text-purple-900 rounded-xl border border-[#E2D2EA] transition flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer h-[34px]"
              title="ดูโครงสร้าง DB schema.sql"
            >
              <Database className="w-4 h-4 text-purple-600" />
              <span>DB Schema</span>
            </button>

            {/* Notification Drawer Toggle */}
            <button
              onClick={() => setNotificationDrawerOpen(!notificationDrawerOpen)}
              className="relative p-2 bg-[#FCFAF7] hover:bg-[#FFEBF3]/50 text-purple-900 rounded-xl border border-[#E2D2EA] transition shadow-xs cursor-pointer h-[34px] flex items-center justify-center"
              title="การแจ้งเตือนล่าสุด"
            >
              <Bell className="w-4 h-4 text-purple-700" />
              {pendingOverdueCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFEBF3] text-purple-950 rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce shadow-xs border border-[#E2D2EA]">
                  {pendingOverdueCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setNotificationDrawerOpen(!notificationDrawerOpen)}
              className="relative p-2 bg-slate-100 text-slate-800 rounded-xl border border-slate-200"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {pendingOverdueCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {pendingOverdueCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-200 border border-slate-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Tab Navigation Row */}
        <nav className="hidden lg:flex items-center gap-2 mt-3 pt-2.5 border-t border-purple-100/60 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${isActive
                  ? 'bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] text-purple-950 border border-[#E2D2EA] shadow-xs scale-[1.02]'
                  : 'text-purple-900/80 hover:text-purple-950 hover:bg-[#FFEBF3]/30 border border-transparent'
                  }`}
              >
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'text-purple-950 scale-110' : 'text-purple-400'}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-950 animate-pulse shadow-xs" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 space-y-4 animate-in slide-in-from-top duration-200 shadow-xl">


          <div className="pt-2 border-t border-pink-100 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onSelectTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${isActive ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md' : 'text-rose-800 hover:bg-pink-50'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Notification Drawer Modal */}
      {notificationDrawerOpen && createPortal(
        <div
          onClick={() => setNotificationDrawerOpen(false)}
          className="fixed inset-0 z-[999] flex justify-end bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white h-full border-l border-pink-200 p-6 overflow-y-auto flex flex-col justify-between shadow-2xl cursor-default animate-in slide-in-from-right duration-300"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-pink-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-pink-600" />
                  <h3 className="font-extrabold text-rose-950">LINE Alert Stream Logs</h3>
                </div>
                <button
                  onClick={() => setNotificationDrawerOpen(false)}
                  className="p-1 rounded-xl text-rose-400 hover:bg-pink-50 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {notificationLogs.length === 0 ? (
                  <p className="text-rose-400 text-sm text-center py-8">ไม่มีประวัติการส่งแจ้งเตือน</p>
                ) : (
                  notificationLogs.map(log => (
                    <div
                      key={log.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${log.stage === 'overdue'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : log.stage === 't_minus_2'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-pink-50/60 border-pink-200 text-rose-900'
                        }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          {log.stage === 'overdue' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                          {log.stage === 't_minus_2' && <Bell className="w-3.5 h-3.5 text-amber-600" />}
                          {log.stage === 't_minus_5' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          ส่งถึง: {log.recipient_name}
                        </span>
                        <span className="text-[10px] text-rose-400">{log.sent_at}</span>
                      </div>
                      <p className="leading-relaxed">{log.message}</p>
                      <div className="flex items-center justify-between text-[10px] text-rose-500 pt-1">
                        <span>LINE Display: @{log.recipient_line}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">
                          Sent via LINE OA
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-pink-100 mt-6">
              <button
                onClick={() => {
                  setNotificationDrawerOpen(false);
                  onSelectTab('notification-engine');
                }}
                className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>ไปที่ Notification Engine</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
