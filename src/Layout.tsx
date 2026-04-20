import React, { useState } from 'react';
import { Building2, LayoutDashboard, Users, Wrench, Receipt, Settings, Bell, User, BarChart, LogOut, Zap, FileText } from 'lucide-react';
import { useAppContext } from './lib/context';
import { Dashboard } from './components/Dashboard';
import { RoomList } from './components/Rooms';
import { Maintenance } from './components/Maintenance';
import { Billing } from './components/Billing';
import { Reports } from './components/Reports';
import { Contracts } from './components/Contracts';
import { Profile } from './components/Profile';
import { Utilities } from './components/Utilities';
import { Login } from './components/Login';
import { cn } from './lib/utils';
import { Badge } from './components/ui';

export function Layout() {
  const { user, role, logout, issues, invoices, isLoaded } = useAppContext();
  const [activeScreen, setActiveScreen] = useState('dashboard');

  if (!isLoaded) {
    return (
      <div className="h-screen bg-[#0f172a] flex items-center justify-center text-[#f8fafc]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#38bdf8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-bold uppercase tracking-widest text-[#94a3b8]">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const getNavItems = () => {
    switch (role) {
      case 'landlord':
        return [
          { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
          { id: 'rooms', label: 'Quản lý phòng', icon: Building2 },
          { id: 'contracts', label: 'Hợp đồng & Hồ sơ', icon: Users },
          { id: 'maintenance', label: 'Bảo trì & Dọn dẹp', icon: Wrench, badge: issues.filter(i => i.status !== 'resolved').length },
          { id: 'billing', label: 'Hóa đơn & Thu chi', icon: Receipt },
          { id: 'utilities', label: 'Điện, Nước & Rác', icon: Zap },
          { id: 'reports', label: 'Báo cáo doanh thu', icon: BarChart },
          { id: 'profile', label: 'Hồ sơ của tôi', icon: Settings },
        ];
      case 'technician':
        return [
          { id: 'dashboard', label: 'Trạng thái chung', icon: LayoutDashboard },
          { id: 'maintenance', label: 'Lịch bảo trì', icon: Wrench, badge: issues.filter(i => i.status !== 'resolved').length },
          { id: 'rooms', label: 'Xem phòng', icon: Building2 },
          { id: 'profile', label: 'Hồ sơ kỹ thuật', icon: User },
        ];
      case 'tenant':
        return [
          { id: 'dashboard', label: 'Trang chủ của tôi', icon: LayoutDashboard },
          { id: 'contracts', label: 'Hợp đồng của tôi', icon: FileText },
          { id: 'billing', label: 'Thanh toán & Hóa đơn', icon: Receipt, badge: invoices.filter(i => i.tenantId === 't1' && i.status !== 'paid').length },
          { id: 'maintenance', label: 'Yêu cầu hỗ trợ', icon: Wrench },
          { id: 'profile', label: 'Hồ sơ cá nhân', icon: User },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard': return <Dashboard />;
      case 'rooms': return <RoomList />;
      case 'maintenance': return <Maintenance />;
      case 'billing': return <Billing />;
      case 'reports': return <Reports />;
      case 'contracts': return <Contracts />;
      case 'profile': return <Profile />;
      case 'utilities': return <Utilities />;
      default: return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] font-sans text-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#020617] text-[#f8fafc] flex flex-col shrink-0 overflow-y-auto border-r border-[#334155]">
        <div className="p-6">
          <div className="flex items-center gap-3 font-bold text-xl mb-1 text-[#38bdf8]">
            <Building2 size={24} />
            Lumea Nest
          </div>
          <p className="text-[#94a3b8] text-[10px] uppercase font-bold tracking-widest leading-tight">Serviced Apartment</p>
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
                    ? "bg-[#38bdf8]/10 text-[#38bdf8]" 
                    : "text-[#94a3b8] hover:bg-[#1e293b]/50 hover:text-[#f8fafc]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  {item.label}
                </div>
                {item.badge ? (
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold", isActive ? "bg-[#38bdf8] text-[#0f172a]" : "bg-[#ef4444] text-white")}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0f172a]">
        <header className="h-[72px] bg-[#0f172a] border-b border-[#334155] flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-[#f8fafc]">
              {user.name}
            </h2>
            <Badge variant="info" className="uppercase text-[9px] tracking-widest">{role}</Badge>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-[#94a3b8] hover:bg-[#1e293b] rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ef4444] rounded-full border-2 border-[#0f172a]"></span>
            </button>
            <div className="h-8 w-8 rounded-lg bg-[#38bdf8]/10 text-[#38bdf8] font-bold flex items-center justify-center border border-[#38bdf8]/20 shadow-lg shadow-[#38bdf8]/5 uppercase">
              {user.name.charAt(0)}
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
