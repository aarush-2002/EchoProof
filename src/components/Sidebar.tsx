/**
 * EchoProof Navigation Sidebar & Responsive Header
 * Team Straw Hats (IIT Patna)
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  FileCheck2, 
  CheckCircle2, 
  Binary, 
  ShieldAlert, 
  BookOpen, 
  Menu, 
  X, 
  Radio
} from 'lucide-react';
import { NavigationTab } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  hasActiveRecording?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  hasActiveRecording = false,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'analyze', label: 'Analyze', icon: Radio },
    { id: 'certificates', label: 'Certificates', icon: FileCheck2 },
    { id: 'verify', label: 'Verify', icon: CheckCircle2 },
    { id: 'forensics', label: 'Forensics', icon: Binary },
    { id: 'defend', label: 'Defend', icon: ShieldAlert },
    { id: 'educate', label: 'Educate', icon: BookOpen },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0d1218] border-b border-[#1b2533] sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-mono text-sm font-semibold tracking-wider text-slate-100 uppercase">
              EchoProof
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-tight">
              VOICE INTEGRITY
            </div>
          </div>
        </div>

        <button
          id="mobile-menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-400 hover:text-slate-200 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-xs z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Persistent Sidebar & Mobile Drawer */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#090d12] border-r border-[#17212d] flex flex-col justify-between z-50 transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Branding & Status */}
        <div className="p-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono text-base font-bold tracking-widest text-slate-100 uppercase">
                ECHOPROOF
              </div>
              <div className="text-[10px] tracking-wider text-slate-400 font-mono uppercase">
                Voice Integrity Platform
              </div>
            </div>
          </div>

          {/* System Status Indicator */}
          <div className="px-3 py-2 rounded bg-[#0d141d] border border-[#1b2736] flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono tracking-wide text-slate-300 uppercase">
                SYSTEM READY
              </span>
            </div>
            {hasActiveRecording && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                ACTIVE
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#121922] border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.id === 'analyze' && hasActiveRecording && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Team Attribution */}
        <div className="p-5 border-t border-[#17212d] bg-[#070a0e]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono font-medium text-slate-300">Straw Hats</span>
            <span className="text-[10px] font-mono text-cyan-400/90 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-500/20">
              IIT PATNA
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span>Utkarsh &amp; Devansh</span>
            <span>v2.4 MVP</span>
          </div>
        </div>
      </aside>
    </>
  );
};
