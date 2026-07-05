import React, { useState, useRef, useEffect } from 'react';
import { Building2, LayoutDashboard, Users, Wrench, Receipt, Settings, Bell, User, BarChart, LogOut, Zap, FileText, CreditCard, Menu, X, CheckCircle2, Edit2, Check } from 'lucide-react';
import { useAppContext } from './lib/context';
import { Dashboard } from './components/Dashboard';
import { RoomList } from './components/Rooms';
import { Maintenance } from './components/Maintenance';
import { Cleaning } from './components/Cleaning';
import { Billing } from './components/Billing';
import { Reports } from './components/Reports';
import { Contracts } from './components/Contracts';
import { Profile } from './components/Profile';
import { Expenses } from './components/Expenses';
import { Electricity } from './components/Electricity';
import { Login } from './components/Login';
import { Tasks } from './components/Tasks';
import { DailyNewsfeed } from './components/DailyNewsfeed';
import { AIFinancialReport } from './components/AIFinancialReport';
import { cn } from './lib/utils';
import { Badge } from './components/ui';

export function Layout() {
  const { user, role, logout, issues, invoices, isLoaded, appName, setAppName } = useAppContext();
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  
  const [isEditingGlobalName, setIsEditingGlobalName] = useState(false);
  const [tempName, setTempName] = useState(appName);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingGlobalName && editInputRef.current) {
        editInputRef.current.focus();
    }
  }, [isEditingGlobalName]);

  useEffect(() => {
     setTempName(appName);
  }, [appName]);

  if (!isLoaded) {
    return (
      <div className="h-screen bg-[#0f172a] flex items-center justify-center text-[#f8fafc]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#38bdf8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-bold uppercase tracking-widest text-[#94a3b8]">Đang tải dữ liệu (isLoaded: {String(isLoaded)})...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const getNavItems = () => {
    if (!role) return [];
    switch (role) {
      case 'landlord':
        return [
          { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
          { id: 'newsfeed', label: 'Bảng tin du lịch', icon: FileText },
          { id: 'rooms', label: 'Quản lý phòng', icon: Building2 },
          { id: 'contracts', label: 'Hợp đồng & Hồ sơ', icon: Users },
          { id: 'tasks', label: 'Giao Việc & Checklist', icon: CheckCircle2 },
          { id: 'maintenance', label: 'Bảo trì', icon: Wrench, badge: issues.filter(i => i.status !== 'resolved' && i.type === 'repair').length },
          { id: 'cleaning', label: 'Vệ sinh phòng', icon: CheckCircle2 },
          { id: 'electricity', label: 'Quản lý tiền điện', icon: Zap },
          { id: 'billing', label: 'Hóa đơn tiền nhà', icon: Receipt },
          { id: 'reports', label: 'Báo cáo doanh thu', icon: BarChart },
          { id: 'ai_financial', label: 'Báo cáo AI (Thuế)', icon: Sparkles },
          { id: 'expenses', label: 'Quản lý chi phí', icon: CreditCard },
          { id: 'profile', label: 'Hồ sơ của tôi', icon: Settings },
        ];
      case 'technician':
        return [
          { id: 'dashboard', label: 'Trạng thái chung', icon: LayoutDashboard },
          { id: 'tasks', label: 'Checklist công việc', icon: CheckCircle2 },
          { id: 'maintenance', label: 'Lịch bảo trì', icon: Wrench, badge: issues.filter(i => i.status !== 'resolved' && i.type === 'repair').length },
          { id: 'cleaning', label: 'Lịch dọn vệ sinh', icon: CheckCircle2 },
          { id: 'profile', label: 'Hồ sơ kỹ thuật', icon: User },
        ];
      case 'tenant':
        return [
          { id: 'dashboard', label: 'Trang chủ của tôi', icon: LayoutDashboard },
          { id: 'contracts', label: 'Hợp đồng của tôi', icon: FileText },
          { id: 'electricity', label: 'Tiền điện', icon: Zap },
          { id: 'billing', label: 'Hóa đơn tiền nhà', icon: Receipt, badge: invoices.filter(i => i.tenantId === 't1' && i.status !== 'paid').length },
          { id: 'maintenance', label: 'Yêu cầu bảo trì', icon: Wrench },
          { id: 'cleaning', label: 'Lịch vệ sinh', icon: CheckCircle2 },
          { id: 'profile', label: 'Hồ sơ cá nhân', icon: User },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const renderScreen = () => {
    if (!user) {
      return <Login />;
    }
    if (!role) {
      return <div className="p-8 text-center text-[#94a3b8]">Đang đợi phân quyền... (user: {user.name})</div>;
    }
    
    try {
      switch (activeScreen) {
        case 'dashboard': return <Dashboard />;
        case 'newsfeed': return <DailyNewsfeed />;
        case 'tasks': return <Tasks />;
        case 'rooms': return <RoomList />;
        case 'maintenance': return <Maintenance />;
        case 'cleaning': return <Cleaning />;
        case 'electricity': return <Electricity />;
        case 'billing': return <Billing />;
        case 'reports': return <Reports />;
        case 'ai_financial': return <AIFinancialReport />;
        case 'contracts': return <Contracts />;
        case 'profile': return <Profile />;
        case 'expenses': return <Expenses />;
        default: return <div className="p-8 text-center text-[#94a3b8]">Màn hình {activeScreen} chưa được cấu hình.</div>;
      }
    } catch (e) {
      console.error("Screen render error:", e);
      return <div className="p-8 text-center text-red-500">Lỗi render màn hình: {String(e)}</div>;
    }
  };

  return (
    <div className="flex h-screen bg-transparent font-sans text-[#f8fafc]">
      {/* Mobile Sidebar Overlay */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-[#020617]/80 backdrop-blur-xl text-[#f8fafc] flex flex-col shrink-0 overflow-y-auto border-r border-white/10 transition-all z-50",
          "fixed inset-y-0 left-0 w-64 transform md:relative md:translate-x-0",
          showMobileMenu ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex flex-col gap-2 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 font-bold text-lg text-[#38bdf8] flex-1 min-w-0 pr-2">
              <Building2 size={24} className="shrink-0" />
              {isEditingGlobalName ? (
                <div className="flex flex-1 items-center gap-1 min-w-0">
                  <input
                    ref={editInputRef}
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="flex-1 bg-[#1e293b] border border-[#38bdf8] rounded px-2 py-1 text-sm text-[#f8fafc] w-full min-w-0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                         setAppName(tempName);
                         setIsEditingGlobalName(false);
                      } else if (e.key === 'Escape') {
                         setTempName(appName);
                         setIsEditingGlobalName(false);
                      }
                    }}
                  />
                  <button onClick={() => { setAppName(tempName); setIsEditingGlobalName(false); }} className="text-[#10b981] p-1 bg-[#10b981]/10 rounded hover:bg-[#10b981]/20">
                    <Check size={16} />
                  </button>
                  <button onClick={() => { setTempName(appName); setIsEditingGlobalName(false); }} className="p-1 text-[#ef4444] bg-[#ef4444]/10 rounded hover:bg-[#ef4444]/20">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <span className="truncate flex-1">{appName}</span>
              )}
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {role === 'landlord' && !isEditingGlobalName && (
                <button 
                  onClick={() => setIsEditingGlobalName(true)}
                  className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors p-1"
                >
                  <Edit2 size={16} />
                </button>
              )}
              <button 
                className="md:hidden text-[#94a3b8] hover:text-[#f8fafc] p-1"
                onClick={() => setShowMobileMenu(false)}
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveScreen(item.id);
                  setShowMobileMenu(false);
                }}
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-transparent">
        <header className="h-[72px] bg-[#0f172a]/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 md:px-8 shrink-0 relative z-30">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              className="md:hidden p-2 text-[#94a3b8] hover:bg-[#1e293b] rounded-lg transition-colors"
              onClick={() => setShowMobileMenu(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-[#f8fafc] hidden md:block">
              {user.name}
            </h2>
            <Badge variant="info" className="uppercase text-[9px] tracking-widest">{role}</Badge>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-[#94a3b8] hover:bg-[#1e293b] rounded-full transition-colors"
                onBlur={() => setTimeout(() => setShowNotifications(false), 200)}
              >
                <Bell size={20} />
                {hasUnreadNotifications && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ef4444] rounded-full border-2 border-[#0f172a]"></span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl overflow-hidden z-50">
                  <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0f172a]/50">
                    <h3 className="font-semibold text-[#f8fafc]">Thông báo</h3>
                    {hasUnreadNotifications && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setHasUnreadNotifications(false);
                          setShowNotifications(false);
                        }}
                        className="text-xs text-[#38bdf8] hover:underline"
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {[
                      { id: 1, title: 'Hóa đơn mới', message: 'Phòng 101 vừa được tạo hóa đơn tháng 4.', time: '5 phút trước' },
                      { id: 2, title: 'Yêu cầu bảo trì', message: 'Phòng 102 báo hỏng vòi nước.', time: '1 giờ trước' },
                      { id: 3, title: 'Thanh toán', message: 'Phòng 103 đã thanh toán thành công.', time: 'Hôm qua' },
                    ].map((note) => (
                      <div key={note.id} className="p-4 border-b border-[#334155]/50 hover:bg-[#334155]/20 cursor-pointer transition-colors relative">
                        {hasUnreadNotifications && <span className="absolute left-2 top-6 w-1.5 h-1.5 bg-[#38bdf8] rounded-full"></span>}
                        <div className="pl-4">
                          <h4 className="text-sm font-semibold text-[#f8fafc]">{note.title}</h4>
                          <p className="text-xs text-[#94a3b8] mt-1 line-clamp-2">{note.message}</p>
                          <span className="text-[10px] text-[#64748b] mt-2 block">{note.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-[#0f172a]/50 backdrop-blur-md text-center inset-x-0 bottom-0 border-t border-white/10">
                    <a href="#" className="text-xs text-[#94a3b8] hover:text-[#f8fafc] transition-colors">Xem tất cả thông báo</a>
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-8 w-8 rounded-lg bg-[#38bdf8]/10 text-[#38bdf8] font-bold flex items-center justify-center border border-[#38bdf8]/20 shadow-lg shadow-[#38bdf8]/5 uppercase">
              {(user.name || 'U').charAt(0)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {renderScreen()}
          </div>
        </div>
      </main>
    </div>
  );
}
