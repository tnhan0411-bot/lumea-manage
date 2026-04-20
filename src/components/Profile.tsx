import React from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardContent, Button, Badge } from './ui';
import { User, Mail, Phone, MapPin, Shield, Settings, LogOut, Key, Building2, Users } from 'lucide-react';

export function Profile() {
  const { user, role, logout, contracts, rooms } = useAppContext();
  
  // Building settings (mock state for now within component or could be in context)
  const [apartmentName, setApartmentName] = React.useState('Lumea Nest Serviced Apartment');
  const [isEditingName, setIsEditingName] = React.useState(false);

  // Mock staff list for landlord (Technicians, other admins)
  const staff = [
    { id: 's1', name: 'Trần Kỹ Thuật', role: 'technician', email: 'tech@lumea.vn', phone: '0922002200' },
    { id: 's2', name: 'Lê Quản Lý', role: 'landlord', email: 'admin2@lumea.vn', phone: '0911001122' }
  ];

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#f8fafc]">Hồ sơ & Cấu hình</h1>
        <Button 
          variant="outline" 
          onClick={logout}
          className="text-[#ef4444] border-[#ef4444]/30 hover:bg-[#ef4444]/10 gap-2"
        >
          <LogOut size={18} /> Đăng xuất
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-2xl bg-[#38bdf8]/10 border-2 border-[#38bdf8] flex items-center justify-center text-4xl font-bold text-[#38bdf8] shadow-xl shadow-[#38bdf8]/10">
                  {user.name.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 p-2 bg-[#1e293b] border border-[#334155] rounded-xl text-[#38bdf8] cursor-pointer shadow-lg hover:bg-[#334155] transition-colors">
                  <Settings size={14} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-[#f8fafc]">{user.name}</h2>
              <div className="mt-2 flex justify-center">
                <Badge variant={role === 'landlord' ? 'info' : role === 'technician' ? 'warning' : 'success'} className="uppercase text-[9px] tracking-widest">
                  {role === 'landlord' ? 'Chủ nhà' : role === 'technician' ? 'Kỹ thuật' : 'Người thuê'}
                </Badge>
              </div>
              
              <div className="mt-6 pt-6 border-t border-[#334155] space-y-4 text-left">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-[#64748b] tracking-widest">Email</p>
                  <p className="text-sm text-[#f8fafc] flex items-center gap-2">
                    <Mail size={14} className="text-[#38bdf8]" /> {user.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-[#64748b] tracking-widest">Số điện thoại</p>
                  <p className="text-sm text-[#f8fafc] flex items-center gap-2">
                    <Phone size={14} className="text-[#38bdf8]" /> {user.phone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#f59e0b]/5 border-[#f59e0b]/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-[#f59e0b]/10 text-[#f59e0b] rounded-xl"><Key size={20} /></div>
              <div className="flex-1">
                <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Bảo mật</p>
                <button className="text-sm text-[#f59e0b] font-medium hover:underline">Đổi mật khẩu</button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          {role === 'landlord' && (
            <Card>
              <div className="px-6 py-4 border-b border-[#334155] flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-[#f8fafc]">
                  <Building2 size={18} className="text-[#38bdf8]" /> Thông tin Căn hộ
                </div>
                <button onClick={() => setIsEditingName(!isEditingName)} className="text-xs text-[#38bdf8] font-bold hover:underline">
                  {isEditingName ? 'Xong' : 'Chỉnh sửa'}
                </button>
              </div>
              <CardContent className="p-6 space-y-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#94a3b8] tracking-widest mb-2">Tên khu căn hộ</label>
                  {isEditingName ? (
                    <input 
                      type="text" 
                      value={apartmentName}
                      onChange={e => setApartmentName(e.target.value)}
                      className="w-full bg-[#0f172a] border-[#334155] rounded-xl p-3 text-[#f8fafc] focus:ring-2 focus:ring-[#38bdf8] outline-none"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-[#f8fafc] tracking-tight">{apartmentName}</p>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-[#1e293b] rounded-xl border border-[#334155]">
                    <p className="text-[9px] uppercase font-bold text-[#64748b]">Tổng phòng</p>
                    <p className="text-xl font-bold text-[#f8fafc] mt-1">{rooms.length}</p>
                  </div>
                  <div className="p-3 bg-[#1e293b] rounded-xl border border-[#334155]">
                    <p className="text-[9px] uppercase font-bold text-[#64748b]">Hợp đồng</p>
                    <p className="text-xl font-bold text-[#10b981] mt-1">{contracts.length}</p>
                  </div>
                  <div className="p-3 bg-[#1e293b] rounded-xl border border-[#334155]">
                    <p className="text-[9px] uppercase font-bold text-[#64748b]">Nhân sự</p>
                    <p className="text-xl font-bold text-[#38bdf8] mt-1">{staff.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {role === 'landlord' ? (
            <Card>
              <div className="px-6 py-4 border-b border-[#334155] flex justify-between items-center">
                 <div className="flex items-center gap-2 font-bold text-[#f8fafc]">
                  <Users size={18} className="text-[#38bdf8]" /> Quản lý Nhân sự / Kỹ thuật
                </div>
                <Button variant="ghost" size="sm" className="text-[#38bdf8] font-bold">+ Thêm thành viên</Button>
              </div>
              <CardContent className="p-0">
                <div className="divide-y divide-[#334155]">
                  {staff.map((s) => (
                    <div key={s.id} className="px-6 py-4 flex justify-between items-center hover:bg-[#334155]/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#334155] rounded-xl flex items-center justify-center font-bold text-[#94a3b8] uppercase">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#f8fafc]">{s.name}</p>
                          <Badge variant={s.role === 'technician' ? 'warning' : 'info'} className="text-[8px] tracking-widest h-auto py-0">{s.role}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-[#f8fafc]">{s.phone}</p>
                          <p className="text-[10px] text-[#64748b]">{s.email}</p>
                        </div>
                        <button className="p-2 text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-colors">
                          <LogOut size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Tenant Contract Summary */}
              <Card>
                <div className="px-6 py-4 border-b border-[#334155] flex items-center gap-2 font-bold text-[#f8fafc]">
                  <FileText size={18} className="text-[#38bdf8]" /> Tóm tắt Hợp đồng thuê
                </div>
                <CardContent className="p-6 grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest">Phòng đang thuê</p>
                    <p className="text-[#f8fafc] font-bold text-lg">P.101</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest">Ngày dời vào</p>
                    <p className="text-[#f8fafc] font-bold text-lg">01/01/2026</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest">Tiền cọc giữ chỗ</p>
                    <p className="text-[#10b981] font-bold text-lg">10.000.000đ</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest">Trạng thái</p>
                    <Badge variant="success">Hợp lệ</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <div className="px-6 py-4 border-b border-[#334155] flex items-center gap-2 font-bold text-[#f8fafc]">
                  <Shield size={18} className="text-[#10b981]" /> Chính sách & Nội quy
                </div>
                <CardContent className="p-6 text-sm text-[#94a3b8] space-y-4">
                  <div className="p-4 bg-[#0f172a] rounded-xl border border-[#334155] space-y-3">
                    <div className="flex gap-3">
                      <div className="shrink-0 w-5 h-5 rounded-full bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center text-[10px] font-bold">1</div>
                      <p>Đóng tiền phòng đúng hạn trước ngày 05 hàng tháng.</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="shrink-0 w-5 h-5 rounded-full bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center text-[10px] font-bold">2</div>
                      <p>Giữ gìn vệ sinh chung và trật tự sau 23h.</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="shrink-0 w-5 h-5 rounded-full bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center text-[10px] font-bold">3</div>
                      <p>Báo cáo ngay khi có sự cố kỹ thuật thông qua mục "Hỗ trợ".</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Local helpers for icon consistency
function FileText(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14.5 2 14.5 7.5 20 7.5"/></svg>; }
