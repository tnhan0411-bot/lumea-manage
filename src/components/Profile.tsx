import React from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardContent, Button, Badge } from './ui';
import { User, Mail, Phone, MapPin, Shield, Settings, LogOut, Key, Building2, Users } from 'lucide-react';

export function Profile() {
  const { role, setRole, tenants } = useAppContext();
  
  // Mock current user data based on role
  const currentUser = role === 'landlord' ? {
    name: 'Phạm Minh Chủ',
    email: 'chulan@example.com',
    phone: '0988776655',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    staff: [
      { name: 'Hoàng Nhân Viên', role: 'Quản lý vận hành', phone: '0912345678' },
      { name: 'Lê Bảo Vệ', role: 'Bảo vệ/An ninh', phone: '0987654321' }
    ]
  } : {
    name: 'Nguyễn Văn A',
    email: 'vana@example.com',
    phone: '0901234567',
    room: 'P.101',
    joinDate: '01/01/2026'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#f8fafc]">Hồ sơ cá nhân</h1>
        <Button variant="outline" className="text-[#ef4444] border-[#ef4444]/30 hover:bg-[#ef4444]/10 gap-2">
          <LogOut size={18} /> Đăng xuất
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full bg-[#38bdf8]/10 border-2 border-[#38bdf8] flex items-center justify-center text-4xl font-bold text-[#38bdf8]">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="absolute bottom-0 right-0 p-1.5 bg-[#1e293b] border border-[#334155] rounded-full text-[#38bdf8] cursor-pointer shadow-lg">
                  <Settings size={14} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-[#f8fafc]">{currentUser.name}</h2>
              <Badge variant="info" className="mt-2">
                {role === 'landlord' ? 'Chủ nhà' : 'Người thuê'}
              </Badge>
              <div className="mt-6 pt-6 border-t border-[#334155] space-y-3 text-left">
                <div className="flex items-center gap-3 text-[#94a3b8] text-sm">
                  <Mail size={16} /> <span>{currentUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-[#94a3b8] text-sm">
                  <Phone size={16} /> <span>{currentUser.phone}</span>
                </div>
                {role === 'landlord' && (
                  <div className="flex items-center gap-3 text-[#94a3b8] text-sm">
                    <MapPin size={16} /> <span>{currentUser.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#f59e0b]/5 border-[#f59e0b]/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-[#f59e0b]/10 text-[#f59e0b] rounded-xl"><Key size={20} /></div>
              <div>
                <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Mật khẩu</p>
                <button className="text-sm text-[#f59e0b] font-medium hover:underline">Đổi mật khẩu</button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          {role === 'landlord' ? (
            <>
              {/* Complex Info */}
              <Card>
                <div className="px-6 py-4 border-b border-[#334155] flex items-center gap-2 font-bold text-[#f8fafc]">
                  <Building2 size={18} className="text-[#38bdf8]" /> Thông tin Căn hộ/Tòa nhà
                </div>
                <CardContent className="p-6 grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-widest">Tên vận hành</p>
                    <p className="text-[#f8fafc] font-medium text-lg italic">The Elegant Residences</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-widest">Số lượng phòng</p>
                    <p className="text-[#f8fafc] font-medium text-lg">10 Phòng</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-widest">Hợp đồng active</p>
                    <p className="text-[#10b981] font-bold text-lg">7 Hợp đồng</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-widest">Nhân sự liên quan</p>
                    <p className="text-[#f8fafc] font-medium text-lg">2 Thành viên</p>
                  </div>
                </CardContent>
              </Card>

              {/* Staff Management */}
              <Card>
                <div className="px-6 py-4 border-b border-[#334155] flex justify-between items-center">
                   <div className="flex items-center gap-2 font-bold text-[#f8fafc]">
                    <Users size={18} className="text-[#38bdf8]" /> Danh sách Nhân viên
                  </div>
                  <Button variant="ghost" size="sm" className="text-[#38bdf8]">+ Thêm</Button>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y divide-[#334155]">
                    {currentUser.staff.map((s, i) => (
                      <div key={i} className="px-6 py-4 flex justify-between items-center hover:bg-[#334155]/10">
                        <div>
                          <p className="font-bold text-[#f8fafc]">{s.name}</p>
                          <p className="text-xs text-[#94a3b8]">{s.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-[#f8fafc]">{s.phone}</p>
                          <button className="text-[10px] text-[#ef4444] font-bold hover:underline">Gỡ bỏ</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Tenant Contract Summary */}
              <Card>
                <div className="px-6 py-4 border-b border-[#334155] flex items-center gap-2 font-bold text-[#f8fafc]">
                  <FileText size={18} className="text-[#38bdf8]" /> Tóm tắt Hợp đồng thuê
                </div>
                <CardContent className="p-6 grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-widest">Phòng đang thuê</p>
                    <p className="text-[#f8fafc] font-bold text-lg">P.101</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-widest">Ngày dời vào</p>
                    <p className="text-[#f8fafc] font-medium text-lg">01/01/2026</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-widest">Tiền cọc giữ chỗ</p>
                    <p className="text-[#10b981] font-bold text-lg">10.000.000đ</p>
                  </div>
                </CardContent>
              </Card>
              
               <Card>
                <div className="px-6 py-4 border-b border-[#334155] flex items-center gap-2 font-bold text-[#f8fafc]">
                  <Shield size={18} className="text-[#10b981]" /> Chính sách & Nội quy
                </div>
                <CardContent className="p-6 text-sm text-[#94a3b8] space-y-3">
                  <ol className="list-decimal pl-4 space-y-2">
                    <li>Đóng tiền phòng đúng hạn trước ngày 05 hàng tháng.</li>
                    <li>Giữ gìn vệ sinh chung và trật tự sau 23h.</li>
                    <li>Báo cáo ngay khi có sự cố kỹ thuật thông qua mục "Hỗ trợ".</li>
                    <li>Không tự ý thay đổi kết cấu phòng khi chưa được đồng ý.</li>
                  </ol>
                </CardContent>
              </Card>
            </>
          )}
          
          <div className="flex justify-center pt-4">
            <Button variant="outline" className="w-[200px]" onClick={() => setRole(role === 'landlord' ? 'tenant' : 'landlord')}>
              CHUYỂN SANG VAI {role === 'landlord' ? 'NGƯỜI THUÊ' : 'CHỦ NHÀ'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Local helpers for icon consistency
function FileText(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14.5 2 14.5 7.5 20 7.5"/></svg>; }
