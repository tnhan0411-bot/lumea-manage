import React from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardContent, CardHeader, Badge, Button } from './ui';
import { Users, Home, AlertCircle, DollarSign, Wrench, Calendar, CheckCircle, Sparkles, BarChart as BarChartIcon, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { user, role, rooms, tenants, issues, invoices, currentTenantId } = useAppContext();
  const [period, setPeriod] = React.useState('2026-Q2');
  const [dateRange, setDateRange] = React.useState({ start: '', end: '' });
  
  // Technician View
  if (role === 'technician') {
    const techIssues = issues.filter(i => i.status !== 'resolved');
    const cleaningTasks = rooms.filter(r => r.cleaningSchedule.length > 0)
      .flatMap(r => r.cleaningSchedule.map(date => ({ roomId: r.id, roomNumber: r.number, date })))
      .sort((a, b) => a.date.localeCompare(b.date));

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#f8fafc]">Chào kỹ thuật viên, {user?.name}</h1>
            <p className="text-sm text-[#94a3b8]">Dưới đây là lịch trình xử lý sự cố và dọn dẹp</p>
          </div>
          <Badge variant="info">Ca làm việc sáng</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-[#ef4444]/20">
            <CardHeader title="Sự cố cần sửa chữa" />
            <CardContent>
              <div className="space-y-4">
                {techIssues.length === 0 ? <p className="text-[#94a3b8] italic">Không có sự cố tồn đọng.</p> : 
                  techIssues.map(issue => (
                    <div key={issue.id} className="p-4 bg-[#ef4444]/5 rounded-xl border border-[#ef4444]/10 flex items-start justify-between">
                       <div>
                          <p className="font-bold text-[#f8fafc]">{issue.title}</p>
                          <p className="text-xs text-[#94a3b8] mt-1">Phòng {rooms.find(r => r.id === issue.roomId)?.number} • Báo cáo: {issue.createdAt}</p>
                       </div>
                       <Badge variant={issue.status === 'in-progress' ? 'info' : 'warning'}>
                         {issue.status === 'in-progress' ? 'Đang sửa' : 'Chưa xử lý'}
                       </Badge>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#10b981]/20">
            <CardHeader title="Lịch dọn vệ sinh" />
            <CardContent>
              <div className="space-y-4">
                {cleaningTasks.slice(0, 5).map((task, idx) => (
                  <div key={idx} className="p-4 bg-[#10b981]/5 rounded-xl border border-[#10b981]/10 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#10b981]/10 rounded-lg flex items-center justify-center font-bold text-[#10b981]">
                          {task.roomNumber}
                        </div>
                        <div>
                           <p className="font-bold text-[#f8fafc]">Vệ sinh phòng</p>
                           <p className="text-xs text-[#94a3b8] mt-1">Dự kiến: {task.date}</p>
                        </div>
                     </div>
                     <Badge variant="success">Yêu cầu</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (role === 'tenant') {
    const myTenant = tenants.find(t => t.id === currentTenantId);
    const myRoom = rooms.find(r => r.id === myTenant?.roomId);
    const myInvoices = invoices.filter(i => i.tenantId === currentTenantId);
    const pendingInvoices = myInvoices.filter(i => i.status === 'pending' || i.status === 'overdue');
    const myIssues = issues.filter(i => i.roomId === myRoom?.id);

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#f8fafc]">Chào mừng quay trở lại, {user?.name}!</h1>
        
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
  
  // Refined Revenue Calculation based on Period or Date Range
  const getInvoicesForPeriod = () => {
    if (dateRange.start && dateRange.end) {
      return invoices.filter(inv => {
        // inv.month is YYYY-MM
        const invMonth = inv.month;
        const startMonth = dateRange.start.slice(0, 7);
        const endMonth = dateRange.end.slice(0, 7);
        return invMonth >= startMonth && invMonth <= endMonth;
      });
    }

    return invoices.filter(inv => {
      // Use inv.month (YYYY-MM) for matching period
      if (period.includes('Q')) {
        const year = period.split('-')[0];
        const quarter = period.split('-')[1];
        const monthPart = inv.month.split('-')[1];
        const invYear = inv.month.split('-')[0];
        if (invYear !== year) return false;
        if (quarter === 'Q1') return ['01', '02', '03'].includes(monthPart);
        if (quarter === 'Q2') return ['04', '05', '06'].includes(monthPart);
        if (quarter === 'Q3') return ['07', '08', '09'].includes(monthPart);
        if (quarter === 'Q4') return ['10', '11', '12'].includes(monthPart);
      } else {
        // Month format: YYYY-MM explicitly matches inv.month
        return inv.month === period;
      }
      return false;
    });
  };

  const currentPeriodInvoices = getInvoicesForPeriod();
  const totalRevenue = currentPeriodInvoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
  const pendingRevenue = currentPeriodInvoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0);

  // Dynamic Chart Data based on period/range
  const getChartData = () => {
    if (dateRange.start && dateRange.end) {
      // For date range, show last 4 months in chart anyway or try to fit?
      // Let's show the months within the range or last 4
    }

    if (period.includes('Q')) {
      const year = period.split('-')[0];
      const quarter = period.split('-')[1];
      const months = quarter === 'Q1' ? ['01', '02', '03'] : quarter === 'Q2' ? ['04', '05', '06'] : quarter === 'Q3' ? ['07', '08', '09'] : ['10', '11', '12'];
      return months.map(m => {
        const p = `${year}-${m}`;
        const rev = invoices.filter(i => i.status === 'paid' && i.month === p).reduce((sum, inv) => sum + inv.total, 0);
        return { name: `T${parseInt(m)}`, revenue: rev };
      });
    } else {
      // Show last 4 months up to current selection
      const [year, month] = (dateRange.end || period).split('-').map(Number);
      const data = [];
      for (let i = 3; i >= 0; i--) {
        let m = month - i;
        let y = year;
        if (m <= 0) {
          m += 12;
          y -= 1;
        }
        const mStr = m < 10 ? `0${m}` : `${m}`;
        const p = `${y}-${mStr}`;
        const rev = invoices.filter(i => i.status === 'paid' && i.month === p).reduce((sum, inv) => sum + inv.total, 0);
        data.push({ name: `T${m}/${y.toString().slice(-2)}`, revenue: rev });
      }
      return data;
    }
  };

  const chartData = getChartData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc]">Tổng quan hệ thống</h1>
          <p className="text-sm text-[#94a3b8]">Chào mừng bạn trở lại, {user?.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-xl px-3 py-1">
             <span className="text-[10px] uppercase font-bold text-[#64748b]">Từ</span>
             <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="bg-transparent text-xs text-[#f8fafc] outline-none"
             />
             <span className="text-[10px] uppercase font-bold text-[#64748b]">Đến</span>
             <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="bg-transparent text-xs text-[#f8fafc] outline-none"
             />
             {(dateRange.start || dateRange.end) && (
               <button onClick={() => setDateRange({start: '', end: ''})} className="text-[#ef4444] hover:text-[#ef4444]/80 ml-1">
                 <X size={14} />
               </button>
             )}
          </div>

          <select 
            value={period}
            disabled={!!(dateRange.start && dateRange.end)}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-sm text-[#f8fafc] outline-none hover:bg-[#334155]/50 transition-colors disabled:opacity-50"
          >
            <option value="2026-Q1">Quý I / 2026</option>
            <option value="2026-Q2">Quý II / 2026</option>
            <option value="2026-04">Tháng 4 / 2026</option>
            <option value="2026-05">Tháng 5 / 2026</option>
          </select>
          <Button variant="outline" className="gap-2">
            <BarChartIcon size={18} /> Xuất báo cáo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-[#38bdf8]/10 text-[#38bdf8] rounded-lg">
              <Home size={24} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-[#94a3b8]">Lấp đầy</p>
              <p className="text-2xl font-bold text-[#f8fafc] mt-1">{occupiedRooms}/{rooms.length} <span className="text-sm font-normal text-[#94a3b8]">phòng</span></p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-[#10b981]/10 text-[#10b981] rounded-lg">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-[#94a3b8]">Doanh thu kỳ</p>
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
              <p className="text-[11px] uppercase tracking-wider font-bold text-[#94a3b8]">Chờ thanh toán</p>
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
              <p className="text-[11px] uppercase tracking-wider font-bold text-[#94a3b8]">Đang bảo trì</p>
              <p className="text-2xl font-bold text-[#f8fafc] mt-1">{maintenanceRooms}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title={`Biểu đồ doanh thu - ${dateRange.start && dateRange.end ? `${dateRange.start} đến ${dateRange.end}` : period}`} />
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => `${value / 1000000}Tr`}
                  tick={{fill: '#f8fafc', fontSize: 12}}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()} ₫`, 'Doanh thu']}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px', border: '1px solid #334155' }}
                />
                <Bar dataKey="revenue" fill="#38bdf8" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Hoạt động bảo trì" />
          <CardContent>
            <div className="space-y-5">
              {issues.slice(0, 4).map(issue => (
                <div key={issue.id} className="flex gap-4 items-start group">
                  <div className="p-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-[#94a3b8] group-hover:border-[#38bdf8] transition-colors">
                    <Wrench size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-[#f8fafc]">P.{rooms.find(r => r.id === issue.roomId)?.number}</p>
                      <span className="text-[10px] text-[#94a3b8] font-medium uppercase">{issue.createdAt}</span>
                    </div>
                    <p className="text-xs text-[#94a3b8] mt-0.5 line-clamp-1">{issue.title}</p>
                    <div className="mt-2 flex items-center gap-2">
                       <div className={cn("w-1.5 h-1.5 rounded-full", issue.status === 'resolved' ? "bg-[#10b981]" : "bg-[#f59e0b]")}></div>
                       <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">{issue.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
