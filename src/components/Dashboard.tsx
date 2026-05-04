import React from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardContent, CardHeader, Badge, Button } from './ui';
import { Users, Home, AlertCircle, DollarSign, Wrench, Calendar, CheckCircle, Sparkles, BarChart as BarChartIcon, X, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn, formatVND } from '../lib/utils';

export function Dashboard() {
  const { user, role, rooms, tenants, issues, invoices, currentTenantId, expenses, checkMonthlyBilling, updateIssue } = useAppContext();
  const [period, setPeriod] = React.useState('2026-Q2');
  const [dateRange, setDateRange] = React.useState({ start: '', end: '' });
  
  // Technician role filter states
  const [techFilterMode, setTechFilterMode] = React.useState<'period' | 'range'>('period');
  const [techPeriod, setTechPeriod] = React.useState('2026-Q2');
  const [techDateRange, setTechDateRange] = React.useState({ start: '', end: '' });
  
  const billingStatus = role === 'landlord' ? checkMonthlyBilling() : { pendingRooms: [], generateAll: () => {} };

  // Technician View
  if (role === 'technician') {
    const techIssues = issues.filter(i => i.status !== 'resolved');
    
    // Filter resolved tasks
    let resolvedIssues = issues.filter(i => i.status === 'resolved');
    if (techFilterMode === 'range' && techDateRange.start && techDateRange.end) {
      resolvedIssues = resolvedIssues.filter(i => i.createdAt >= techDateRange.start && i.createdAt <= techDateRange.end);
    } else if (techFilterMode === 'period') {
      const year = techPeriod.split('-')[0];
      const part = techPeriod.split('-')[1];
      resolvedIssues = resolvedIssues.filter(i => {
        if (!i.createdAt) return false;
        const iYear = i.createdAt.split('-')[0];
        const iMonth = parseInt(i.createdAt.split('-')[1], 10);
        if (iYear !== year) return false;
        if (part === 'Q1' && iMonth >= 1 && iMonth <= 3) return true;
        if (part === 'Q2' && iMonth >= 4 && iMonth <= 6) return true;
        if (part === 'Q3' && iMonth >= 7 && iMonth <= 9) return true;
        if (part === 'Q4' && iMonth >= 10 && iMonth <= 12) return true;
        return false;
      });
    }

    const cleaningTasks = rooms.filter(r => r.cleaningSchedule?.length > 0)
      .flatMap(r => r.cleaningSchedule?.map(date => ({ roomId: r.id, roomNumber: r.number, date })) || [])
      .sort((a, b) => a.date.localeCompare(b.date));

    // Handle CSV Export
    const handleExport = () => {
      const headings = ['ID', 'Loại công việc', 'Phòng', 'Mô tả', 'Ngày báo cáo'];
      const rows = resolvedIssues.map(i => [
        i.id,
        i.type === 'repair' ? 'Sửa chữa' : 'Dọn dẹp',
        i.roomId === 'elevator' ? 'Thang máy' : i.roomId === 'other' ? 'Khác' : rooms.find(r => r.id === i.roomId)?.number || '',
        i.title,
        i.createdAt
      ]);
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + headings.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Bao_Cao_Cong_Viec_${techFilterMode === 'range' ? techDateRange.start + '_' + techDateRange.end : techPeriod}.csv`);
      document.body.appendChild(link); // Required for FF
      link.click();
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#f8fafc]">Chào kỹ thuật viên, {user?.name}</h1>
            <p className="text-sm text-[#94a3b8]">Dưới đây là lịch trình xử lý sự cố và dọn dẹp</p>
          </div>
          <Badge variant="info">Ca làm việc sáng</Badge>
        </div>

        {/* Existing Blocks for Pending Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-[#ef4444]/20">
            <CardHeader title="Sự cố cần sửa chữa" />
            <CardContent>
              <div className="space-y-4">
                {techIssues.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-[#1e293b]/50 rounded-xl border border-[#334155]/50">
                    <CheckCircle2 className="w-16 h-16 text-[#10b981] mb-4" />
                    <h3 className="text-lg font-semibold text-[#f8fafc]">Tuyệt vời!</h3>
                    <p className="text-[#94a3b8] mt-2 max-w-[250px]">Hiện tại không có sự cố nào cần xử lý. Hãy nghỉ ngơi một chút nhé!</p>
                  </div>
                ) : 
                  techIssues.map(issue => (
                    <div key={issue.id} className="p-4 bg-[#ef4444]/5 rounded-xl border border-[#ef4444]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                       <div>
                          <p className="font-bold text-[#f8fafc]">{issue.title}</p>
                          <p className="text-xs text-[#94a3b8] mt-1">Phòng {rooms.find(r => r.id === issue.roomId)?.number} • Báo cáo: {issue.createdAt}</p>
                       </div>
                       <div className="flex items-center gap-3">
                         <Badge variant={issue.status === 'in-progress' ? 'info' : 'warning'}>
                           {issue.status === 'in-progress' ? 'Đang sửa' : 'Chưa xử lý'}
                         </Badge>
                         {issue.status === 'open' && (
                           <Button variant="outline" size="sm" onClick={() => updateIssue(issue.id, 'in-progress')}>
                             Tiếp nhận
                           </Button>
                         )}
                         <Button variant="primary" size="sm" onClick={() => updateIssue(issue.id, 'resolved')}>
                           Hoàn thành
                         </Button>
                       </div>
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
                {cleaningTasks.length === 0 ? (
                  <div className="text-center py-8 text-[#94a3b8]">Không có lịch dọn vệ sinh.</div>
                ) : cleaningTasks.slice(0, 5).map((task, idx) => (
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

        {/* Dashboard for Completed Tasks & Report Export */}
        <Card className="border-[#38bdf8]/20">
          <div className="p-6 border-b border-[#334155] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#f8fafc] flex items-center gap-2">
                <CheckCircle2 size={20} className="text-[#38bdf8]" />
                Công việc đã hoàn thành
              </h2>
              <p className="text-sm text-[#94a3b8] mt-1">Thống kê và xuất báo cáo công việc</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex bg-[#0f172a] border border-[#334155] rounded-lg p-1">
                <button 
                  onClick={() => setTechFilterMode('period')}
                  className={cn("px-4 py-1.5 text-xs font-medium rounded-lg transition-colors", techFilterMode === 'period' ? "bg-[#38bdf8]/20 text-[#38bdf8]" : "text-[#94a3b8] hover:text-[#f8fafc]")}
                >
                  Theo Quý
                </button>
                <button 
                  onClick={() => setTechFilterMode('range')}
                  className={cn("px-4 py-1.5 text-xs font-medium rounded-lg transition-colors", techFilterMode === 'range' ? "bg-[#38bdf8]/20 text-[#38bdf8]" : "text-[#94a3b8] hover:text-[#f8fafc]")}
                >
                  Tùy chọn
                </button>
              </div>

              {techFilterMode === 'range' ? (
                <div className="flex items-center gap-2">
                  <input type="date" value={techDateRange.start} onChange={e => setTechDateRange({...techDateRange, start: e.target.value})} className="bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-sm text-[#f8fafc]" />
                  <span className="text-[#94a3b8]">-</span>
                  <input type="date" value={techDateRange.end} onChange={e => setTechDateRange({...techDateRange, end: e.target.value})} className="bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-sm text-[#f8fafc]" />
                </div>
              ) : (
                <select 
                  value={techPeriod} 
                  onChange={e => setTechPeriod(e.target.value)}
                  className="bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-sm text-[#f8fafc]"
                >
                  <option value="2026-Q1">Quý 1 / 2026</option>
                  <option value="2026-Q2">Quý 2 / 2026</option>
                  <option value="2026-Q3">Quý 3 / 2026</option>
                  <option value="2026-Q4">Quý 4 / 2026</option>
                </select>
              )}

              <Button onClick={handleExport} variant="primary" className="flex items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.3)] min-w-[140px]">
                {/* FileDown import icon is not defined, we'll use a standard text or if imported, use it. But wait, I see `AlertCircle` is imported but I need to make sure `FileDown` is available or just use another icon, let's use BarChartIcon */}
                <BarChartIcon size={16} /> Xuất báo cáo
              </Button>
            </div>
          </div>
          <CardContent>
            {resolvedIssues.length === 0 ? (
              <div className="py-8 text-center text-[#94a3b8]">Không có công việc nào hoàn thành trong thời gian này.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#94a3b8]">
                  <thead className="bg-[#1e293b]/50 border-b border-[#334155]">
                    <tr>
                      <th className="px-4 py-3 font-medium uppercase text-xs tracking-wider text-[#f8fafc]">Ngày báo cáo</th>
                      <th className="px-4 py-3 font-medium uppercase text-xs tracking-wider text-[#f8fafc]">Phòng/Vị trí</th>
                      <th className="px-4 py-3 font-medium uppercase text-xs tracking-wider text-[#f8fafc]">Sự cố</th>
                      <th className="px-4 py-3 font-medium uppercase text-xs tracking-wider text-[#f8fafc]">Loại</th>
                      <th className="px-4 py-3 font-medium uppercase text-xs tracking-wider text-[#f8fafc]">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]">
                    {resolvedIssues.map(issue => (
                      <tr key={issue.id} className="hover:bg-[#334155]/20 transition-colors">
                        <td className="px-4 py-3 text-[#f8fafc] whitespace-nowrap">{issue.createdAt}</td>
                        <td className="px-4 py-3 text-[#f8fafc]">
                          {issue.roomId === 'elevator' ? 'Thang máy' : issue.roomId === 'other' ? 'Khác' : `Phòng ${rooms.find(r => r.id === issue.roomId)?.number || ''}`}
                        </td>
                        <td className="px-4 py-3 text-[#f8fafc]">{issue.title}</td>
                        <td className="px-4 py-3">
                          <span className="text-[#38bdf8] font-medium">{issue.type === 'repair' ? 'Sửa chữa' : 'Dọn dẹp'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="success">Hoàn thành</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
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
                  {myRoom?.cleaningSchedule?.[0] || 'Chưa có lịch'}
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
                       <p className="text-sm text-[#94a3b8] mt-1">Hạn thanh toán là ngày 05/05. Tổng tiền: {formatVND(pendingInvoices[0].total)}</p>
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
                  {myIssues.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center bg-[#1e293b]/50 rounded-xl border border-[#334155]/50">
                      <CheckCircle2 className="w-12 h-12 text-[#10b981] mb-3" />
                      <h3 className="text-base font-semibold text-[#f8fafc]">Tuyệt vời!</h3>
                      <p className="text-[#94a3b8] text-sm mt-1 max-w-[250px]">Hiện tại không có sự cố nào cần xử lý. Hãy nghỉ ngơi một chút nhé!</p>
                    </div>
                  ) : 
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
  
  const [filterMode, setFilterMode] = React.useState<'period' | 'range'>('period');

  // Visa Expiration Tracking
  const visaExpirations = tenants
    .filter(t => t.visaExpiry)
    .map(t => {
      const expiryDate = new Date(t.visaExpiry!);
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...t, daysLeft: diffDays };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const criticalVisas = visaExpirations.filter(v => v.daysLeft <= 15);

  // Refined Revenue Calculation based on Period or Date Range
  const getInvoicesForPeriod = () => {
    if (filterMode === 'range' && dateRange.start && dateRange.end) {
      return invoices.filter(inv => {
        // inv.month is YYYY-MM
        const invMonth = inv.month;
        const startMonth = dateRange.start.slice(0, 7);
        const endMonth = dateRange.end.slice(0, 7);
        return invMonth >= startMonth && invMonth <= endMonth;
      });
    }

    if (filterMode === 'period') {
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
    }

    return [];
  };

  const currentPeriodInvoices = getInvoicesForPeriod();
  const totalRevenue = currentPeriodInvoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
  const pendingRevenue = currentPeriodInvoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0);

  // Dynamic Chart Data based on period/range
  const getChartData = () => {
    if (filterMode === 'range' && dateRange.start && dateRange.end) {
      const data = [];
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      
      // Calculate months
      let currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const endMonthObj = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

      while (currentMonth <= endMonthObj) {
        const m = currentMonth.getMonth() + 1;
        const y = currentMonth.getFullYear();
        const mStr = m < 10 ? `0${m}` : `${m}`;
        const p = `${y}-${mStr}`;
        const rev = invoices.filter(i => i.status === 'paid' && i.month === p).reduce((sum, inv) => sum + inv.total, 0);
        data.push({ name: `T${m}/${y.toString().slice(-2)}`, revenue: rev });
        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }
      return data;
    }

    if (filterMode === 'period') {
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
        const [year, month] = period.split('-').map(Number);
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
    }

    return [];
  };

  const chartData = getChartData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc]">Lumea Nest Serviced Apartment</h1>
          <p className="text-sm text-[#94a3b8]">Báo cáo hiệu suất kinh doanh • Chào {user?.name}</p>
        </div>
        <div className="flex flex-col lg:flex-row items-end lg:items-center gap-3">
          {criticalVisas.length > 0 && (
            <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 px-3 py-1.5 rounded-xl flex items-center gap-3">
              <AlertCircle size={16} className="text-[#ef4444]" />
              <p className="text-[12px] font-bold text-[#ef4444]">
                {criticalVisas.length} khách sắp hết hạn Visa
              </p>
            </div>
          )}

          {billingStatus.pendingRooms.length > 0 && (
            <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-3 py-1.5 rounded-xl flex items-center gap-3 animate-pulse">
              <AlertCircle size={16} className="text-[#f59e0b]" />
              <p className="text-[12px] font-bold text-[#f59e0b]">
                {billingStatus.pendingRooms.length} phòng tới hạn thu tiền
              </p>
              <Button size="sm" variant="warning" className="h-6 text-[9px] px-2" onClick={billingStatus.generateAll}>
                Tạo nhanh
              </Button>
            </div>
          )}

          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-1 flex">
            <button 
              onClick={() => setFilterMode('period')}
              className={cn("px-4 py-1.5 text-xs font-medium rounded-lg transition-colors", filterMode === 'period' ? "bg-[#38bdf8]/20 text-[#38bdf8]" : "text-[#94a3b8] hover:text-[#f8fafc]")}
            >
              Tháng / Quý
            </button>
            <button 
              onClick={() => setFilterMode('range')}
              className={cn("px-4 py-1.5 text-xs font-medium rounded-lg transition-colors", filterMode === 'range' ? "bg-[#38bdf8]/20 text-[#38bdf8]" : "text-[#94a3b8] hover:text-[#f8fafc]")}
            >
              Khoảng ngày
            </button>
          </div>

          {filterMode === 'range' ? (
            <div className="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-xl px-3 py-1.5 min-w-[280px]">
               <span className="text-[10px] uppercase font-bold text-[#64748b]">Từ</span>
               <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="bg-transparent text-xs text-[#f8fafc] outline-none w-full"
               />
               <span className="text-[10px] uppercase font-bold text-[#64748b]">Đến</span>
               <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="bg-transparent text-xs text-[#f8fafc] outline-none w-full"
               />
            </div>
          ) : (
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-1.5 text-sm text-[#f8fafc] outline-none hover:bg-[#334155]/50 transition-colors h-9"
            >
              <option value="2026-Q1">Quý I / 2026</option>
              <option value="2026-Q2">Quý II / 2026</option>
              <option value="2026-04">Tháng 4 / 2026</option>
              <option value="2026-05">Tháng 5 / 2026</option>
            </select>
          )}

          <Button variant="outline" className="gap-2 h-9 text-sm">
            <BarChartIcon size={16} /> Xuất
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
              <p className="text-2xl font-bold text-[#f8fafc] mt-1">{formatVND(totalRevenue)}</p>
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
              <p className="text-2xl font-bold text-[#f8fafc] mt-1">{formatVND(pendingRevenue)}</p>
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
          <CardHeader title={`Biểu đồ doanh thu - ${filterMode === 'range' && dateRange.start && dateRange.end ? `${dateRange.start} đến ${dateRange.end}` : period}`} />
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
          <CardHeader title="Theo dõi Visa (Stam)" />
          <CardContent>
            <div className="space-y-4">
              {visaExpirations.length === 0 ? (
                <p className="text-sm text-[#94a3b8] italic">Không có dữ liệu visa.</p>
              ) : (
                visaExpirations.slice(0, 5).map(v => (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a] border border-[#334155]">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-full bg-[#1e293b] flex items-center justify-center text-[10px] font-bold text-[#f8fafc]">
                         {(v.name || 'U').charAt(0)}
                       </div>
                       <div>
                         <p className="text-xs font-bold text-[#f8fafc]">{v.name}</p>
                         <p className="text-[10px] text-[#94a3b8]">Phòng {rooms.find(r => r.id === v.roomId)?.number}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className={cn("text-[10px] font-bold", v.daysLeft <= 7 ? "text-[#ef4444]" : v.daysLeft <= 15 ? "text-[#f59e0b]" : "text-[#10b981]")}>
                         {v.daysLeft <= 0 ? 'Đã hết hạn' : `Còn ${v.daysLeft} ngày`}
                       </p>
                       <p className="text-[9px] text-[#64748b]">{v.visaExpiry}</p>
                    </div>
                  </div>
                ))
              )}
              {visaExpirations.length > 5 && (
                <Button variant="ghost" size="sm" className="w-full text-[10px] text-[#38bdf8]">Xem tất cả</Button>
              )}
            </div>
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
