import React from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardContent, CardHeader, Badge, Button } from './ui';
import { Users, Home, AlertCircle, DollarSign, Wrench, Calendar, CheckCircle, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { role, rooms, tenants, issues, invoices, currentTenantId } = useAppContext();

  if (role === 'tenant') {
    const myRoom = rooms.find(r => r.id === tenants.find(t => t.id === currentTenantId)?.roomId);
    const myInvoices = invoices.filter(i => i.tenantId === currentTenantId);
    const pendingInvoices = myInvoices.filter(i => i.status === 'pending' || i.status === 'overdue');
    const myIssues = issues.filter(i => i.roomId === myRoom?.id);

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#f8fafc]">Chào mừng quay trở lại, {tenants.find(t=>t.id === currentTenantId)?.name}!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-[#38bdf8]/5 border-[#38bdf8]/20">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-[#38bdf8]/10 text-[#38bdf8] rounded-lg">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">Tiền phòng tháng này</p>
                <p className="text-2xl font-bold text-[#f8fafc] mt-1">
                  {pendingInvoices.reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}đ
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-[#f59e0b]/10 text-[#f59e0b] rounded-lg">
                <Wrench size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">Yêu cầu đang xử lý</p>
                <p className="text-2xl font-bold text-[#f8fafc] mt-1">
                  {myIssues.filter(i => i.status !== 'resolved').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-[#10b981]/10 text-[#10b981] rounded-lg">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">Ngày dọn phòng tiếp theo</p>
                <p className="text-lg font-bold text-[#f8fafc] mt-1">
                  {myRoom?.cleaningSchedule[0] || 'Chưa có lịch'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Thông báo & Nhắc nhở" />
            <CardContent>
              <div className="space-y-4">
                {pendingInvoices.length > 0 && (
                   <div className="p-4 bg-[#ef4444]/5 hover:bg-[#ef4444]/10 transition-colors rounded-lg border border-[#ef4444]/20 flex items-start gap-3">
                     <AlertCircle className="w-5 h-5 text-[#ef4444] mt-0.5" />
                     <div>
                       <p className="font-medium text-[#f8fafc]">Vui lòng thanh toán tiền phòng!</p>
                       <p className="text-sm text-[#94a3b8] mt-1">Hạn thanh toán là ngày 05/05. Tổng tiền: {pendingInvoices[0].total.toLocaleString()}đ</p>
                       <Button size="sm" className="mt-3">Thanh toán ngay</Button>
                     </div>
                   </div>
                )}
                {myIssues.filter(i => i.status === 'in-progress').length > 0 && (
                  <div className="p-4 bg-[#f59e0b]/5 hover:bg-[#f59e0b]/10 transition-colors rounded-lg border border-[#f59e0b]/20 flex items-start gap-3">
                    <Wrench className="w-5 h-5 text-[#f59e0b] mt-0.5" />
                    <div>
                      <p className="font-medium text-[#f8fafc]">Cập nhật báo cáo sự cố</p>
                      <p className="text-sm text-[#94a3b8] mt-1">Kỹ thuật viên đang xử lý yêu cầu "{myIssues.find(i=>i.status==='in-progress')?.title}".</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
             <CardHeader title="Hoạt động gần đây" />
             <CardContent>
                <div className="space-y-3">
                  {myIssues.length === 0 ? <p className="text-[#94a3b8] italic text-sm">Chưa có lịch sử hoạt động.</p> : 
                    myIssues.slice(0, 5).map(issue => (
                      <div key={issue.id} className="flex justify-between items-center py-3 border-b last:border-0 border-[#334155]/30">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", issue.type === 'cleaning' ? "bg-[#10b981]/10 text-[#10b981]" : "bg-[#38bdf8]/10 text-[#38bdf8]")}>
                            {issue.type === 'cleaning' ? <Sparkles size={14} /> : <Wrench size={14} />}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-[#f8fafc]">{issue.title}</p>
                            <p className="text-[10px] text-[#94a3b8] mt-0.5">{issue.createdAt}</p>
                          </div>
                        </div>
                        <Badge variant={issue.status === 'resolved' ? 'success' : issue.status === 'in-progress' ? 'info' : 'warning'}>
                          {issue.status === 'resolved' ? 'Xong' : issue.status === 'in-progress' ? 'Đang làm' : 'Mới'}
                        </Badge>
                      </div>
                    ))
                  }
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Landlord Dashboard
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
  const pendingRevenue = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0);

  const chartData = [
    { name: 'T2', revenue: 45000000 },
    { name: 'T3', revenue: 48000000 },
    { name: 'T4', revenue: totalRevenue }, 
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#f8fafc]">Tổng quan hệ thống</h1>
        <Button>
          + Thêm phòng mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-[#38bdf8]/10 text-[#38bdf8] rounded-lg">
              <Home size={24} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-medium text-[#94a3b8]">Tỷ lệ lấp đầy</p>
              <p className="text-2xl font-bold text-[#f8fafc] mt-1">{occupiedRooms}/{rooms.length} <span className="text-sm font-normal text-[#94a3b8]">phòng</span></p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 text-[#10b981] rounded-lg">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-medium text-[#94a3b8]">Doanh thu T10</p>
              <p className="text-2xl font-bold text-[#f8fafc] mt-1">{(totalRevenue / 1000000).toFixed(1)} <span className="text-sm font-normal text-[#94a3b8]">Tr</span></p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-[#ef4444]/10 text-[#ef4444] rounded-lg">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-medium text-[#94a3b8]">Chờ thu</p>
              <p className="text-2xl font-bold text-[#f8fafc] mt-1">{(pendingRevenue / 1000000).toFixed(1)} <span className="text-sm font-normal text-[#94a3b8]">Tr</span></p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-[#f59e0b]/10 text-[#f59e0b] rounded-lg">
              <Wrench size={24} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-medium text-[#94a3b8]">Sự cố cần xử lý</p>
              <p className="text-2xl font-bold text-[#f8fafc] mt-1">{issues.filter(i => i.status !== 'resolved').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Biểu đồ doanh thu 5 tháng gần nhất" />
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => `${value / 1000000}Tr`}
                  tick={{fill: '#f8fafc'}}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()} ₫`, 'Doanh thu']}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                />
                <Bar dataKey="revenue" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Trạng thái phòng" />
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                  <span className="text-sm text-[#94a3b8]">Đang thuê (Full)</span>
                </div>
                <span className="font-medium text-[#f8fafc]">{occupiedRooms}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#38bdf8]"></div>
                  <span className="text-sm text-[#94a3b8]">Trống</span>
                </div>
                <span className="font-medium text-[#f8fafc]">{availableRooms}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                  <span className="text-sm text-[#94a3b8]">Đang bảo trì</span>
                </div>
                <span className="font-medium text-[#f8fafc]">{maintenanceRooms}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#334155]">
              <h4 className="text-sm font-semibold text-[#f8fafc] mb-4">Sự cố mới nhất</h4>
              <div className="space-y-3">
                {issues.slice(0, 3).map(issue => (
                  <div key={issue.id} className="flex gap-3 items-start border-l-2 border-[#ef4444] pl-3">
                    <Wrench className="w-4 h-4 text-[#ef4444] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#f8fafc]">{issue.title}</p>
                      <p className="text-[11px] text-[#94a3b8] mt-0.5">Phòng {rooms.find(r => r.id === issue.roomId)?.number} • {issue.createdAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
