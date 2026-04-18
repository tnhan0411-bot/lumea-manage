import React, { useState } from 'react';
import { Building2, LayoutDashboard, Users, Wrench, Receipt, Settings, LogOut, FileText, Bell } from 'lucide-react';
import { useAppContext } from './lib/context';
import { Dashboard } from './components/Dashboard';
import { RoomList } from './components/Rooms';
import { Maintenance } from './components/Maintenance';
import { Billing } from './components/Billing';
import { cn } from './lib/utils';
import { Badge } from './components/ui';

export function Layout() {
  const { role, setRole, issues, invoices } = useAppContext();
  const [activeScreen, setActiveScreen] = useState('dashboard');

  const navItems = role === 'landlord' ? [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'rooms', label: 'Quản lý phòng', icon: Building2 },
    { id: 'tenants', label: 'Người thuê & Hợp đồng', icon: Users },
    { id: 'maintenance', label: 'Bảo trì & Sự cố', icon: Wrench, badge: issues.filter(i => i.status !== 'resolved').length },
    { id: 'billing', label: 'Hóa đơn & Thu chi', icon: Receipt },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ] : [
    { id: 'dashboard', label: 'Trang chủ của tôi', icon: LayoutDashboard },
    { id: 'billing', label: 'Thanh toán & Hóa đơn', icon: Receipt, badge: invoices.filter(i => i.tenantId === 't1' && i.status !== 'paid').length },
    { id: 'maintenance', label: 'Báo cáo sự cố', icon: Wrench },
    { id: 'contract', label: 'Hợp đồng của tôi', icon: FileText },
  ];

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard': return <Dashboard />;
      case 'rooms': return <RoomList />;
      case 'maintenance': return <Maintenance />;
      case 'billing': return <Billing />;
      default: return <div className="p-8 text-center text-gray-500">Tính năng "{navItems.find(i=>i.id === activeScreen)?.label}" đang được phát triển...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] font-sans text-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#020617] text-[#f8fafc] flex flex-col shrink-0 overflow-y-auto border-r border-[#334155]">
        <div className="p-6">
          <div className="flex items-center gap-3 font-bold text-xl mb-1">
            <div className="bg-[#38bdf8] text-[#0f172a] p-1.5 rounded-lg">
              <Building2 size={24} />
            </div>
            AziManager
          </div>
          <p className="text-[#94a3b8] text-xs">Quản lý căn hộ thông minh</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                  isActive 
                    ? "bg-[#1e293b] text-[#f8fafc]" 
                    : "text-[#94a3b8] hover:bg-[#1e293b]/50 hover:text-[#f8fafc]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-[#f8fafc]" : "text-[#94a3b8]"} />
                  {item.label}
                </div>
                {item.badge ? (
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold", isActive ? "bg-[#38bdf8]/10 text-[#38bdf8]" : "bg-[#ef4444] text-white")}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
            <p className="text-xs text-[#94a3b8] mb-2 uppercase tracking-wider font-semibold">Chế độ xem (Demo)</p>
            <div className="flex bg-[#0f172a] rounded-lg p-1">
              <button 
                onClick={() => { setRole('landlord'); setActiveScreen('dashboard'); }}
                className={cn("flex-1 text-xs py-1.5 rounded-md font-medium transition-colors", role === 'landlord' ? "bg-[#38bdf8] text-[#0f172a]" : "text-[#94a3b8]")}
              >
                Chủ nhà
              </button>
              <button 
                onClick={() => { setRole('tenant'); setActiveScreen('dashboard'); }}
                className={cn("flex-1 text-xs py-1.5 rounded-md font-medium transition-colors", role === 'tenant' ? "bg-[#38bdf8] text-[#0f172a]" : "text-[#94a3b8]")}
              >
                Người thuê
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0f172a]">
        <header className="h-[72px] bg-[#0f172a] border-b border-[#334155] flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-semibold text-[#f8fafc]">
            {role === 'landlord' ? 'Khu Căn Hộ Sunshine (10 Phòng)' : 'Phòng 101 - Nguyễn Văn A'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-[#94a3b8] hover:bg-[#1e293b] rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ef4444] rounded-full border-2 border-[#0f172a]"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-[#38bdf8]/10 text-[#38bdf8] font-bold flex items-center justify-center">
              {role === 'landlord' ? 'AD' : 'VA'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {renderScreen()}
          </div>
        </div>
      </main>
    </div>
  );
}
