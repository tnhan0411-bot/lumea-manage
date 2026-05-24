import React from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardContent, Badge } from './ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ComposedChart, LabelList, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wrench, Sparkles, Receipt, FileBarChart } from 'lucide-react';

export function Reports() {
  const { invoices, expenses, issues, rooms } = useAppContext();
  const [period, setPeriod] = React.useState('2026-04');
  const [pieFormat, setPieFormat] = React.useState<'value' | 'percent'>('value');
  const [showLabels, setShowLabels] = React.useState(true);
  const [showTrendline, setShowTrendline] = React.useState(true);

  // Filter data based on selected period
  const filteredInvoices = invoices.filter(inv => inv.month === period);
  const filteredExpenses = expenses.filter(exp => exp.date.startsWith(period));

  const monthlyRevenue = filteredInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((acc, inv) => acc + inv.total, 0);

  const monthlyExpenses = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);
  
  const profit = monthlyRevenue - monthlyExpenses;

  // Chart Data (showing a range near the selected period)
  const getFinancialData = () => {
    const months = ['2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];
    const mockThu = [120000000, 150000000, 135000000, 180000000, 210000000, 230000000];
    const mockChi = [30000000, 45000000, 35000000, 50000000, 60000000, 70000000];
    return months.map((m, index) => {
      const realThu = invoices.filter(i => i.month === m && i.status === 'paid').reduce((a, b) => a + b.total, 0);
      const realChi = expenses.filter(e => e.date.startsWith(m)).reduce((a, b) => a + b.amount, 0);
      return {
        name: `T${parseInt(m.split('-')[1])}`,
        thu: realThu > 0 ? realThu : mockThu[index],
        chi: realChi > 0 ? realChi : mockChi[index],
      };
    });
  };

  const financialData = getFinancialData();

  const expenseCategoryData = [
    { name: 'Lương', value: filteredExpenses.filter(e => e.category === 'salary').reduce((a, b) => a + b.amount, 0) },
    { name: 'Vệ sinh', value: filteredExpenses.filter(e => e.category === 'cleaning').reduce((a, b) => a + b.amount, 0) },
    { name: 'Công cụ', value: filteredExpenses.filter(e => e.category === 'tools').reduce((a, b) => a + b.amount, 0) },
    { name: 'Vận hành', value: filteredExpenses.filter(e => e.category === 'operation').reduce((a, b) => a + b.amount, 0) },
    { name: 'Bảo trì', value: filteredExpenses.filter(e => e.category === 'maintenance').reduce((a, b) => a + b.amount, 0) },
    { name: 'Lãi vay', value: filteredExpenses.filter(e => e.category === 'interest').reduce((a, b) => a + b.amount, 0) },
  ].filter(d => d.value > 0);

  const totalExpenseFiltered = expenseCategoryData.reduce((sum, item) => sum + item.value, 0);

  const COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#818cf8'];

  const maintenanceHistory = issues.filter(i => i.type === 'repair');
  const cleaningHistory = issues.filter(i => i.status === 'resolved' && i.type === 'cleaning');

  const formatNumber = (num: number) => {
    if (num >= 1000000) return parseFloat((num / 1000000).toFixed(1)) + 'M';
    if (num >= 1000) return parseFloat((num / 1000).toFixed(1)) + 'K';
    return num.toString();
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    if (pieFormat === 'percent' && totalExpenseFiltered > 0) {
      const percentage = (value / totalExpenseFiltered) * 100;
      if (percentage < 3) return null;
      return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="10px" fontWeight="bold">
          {`${percentage.toFixed(1)}%`}
        </text>
      );
    } else {
      if (value === 0) return null;
      return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="10px" fontWeight="bold">
          {formatNumber(value)}
        </text>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#f8fafc] flex items-center gap-2">
          <FileBarChart className="text-[#38bdf8]" /> Báo cáo Tổng hợp
        </h1>
        <div className="flex gap-2">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-1.5 text-xs text-[#f8fafc] outline-none"
          >
             <option value="2026-01">Tháng 1 / 2026</option>
             <option value="2026-02">Tháng 2 / 2026</option>
             <option value="2026-03">Tháng 3 / 2026</option>
             <option value="2026-04">Tháng 4 / 2026</option>
             <option value="2026-05">Tháng 5 / 2026</option>
          </select>
          <Button variant="outline" size="sm">Xuất PDF</Button>
          <Button variant="outline" size="sm">Xuất Excel</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#10b981]/5 border-[#10b981]/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-[#94a3b8]">Tổng Doanh thu (Kỳ này)</p>
                <h3 className="text-2xl font-bold text-[#10b981] mt-1">{monthlyRevenue.toLocaleString()}đ</h3>
              </div>
              <div className="p-2 bg-[#10b981]/10 rounded-lg text-[#10b981]"><TrendingUp size={20} /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#ef4444]/5 border-[#ef4444]/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-[#94a3b8]">Tổng Chi phí (Kỳ này)</p>
                <h3 className="text-2xl font-bold text-[#ef4444] mt-1">{monthlyExpenses.toLocaleString()}đ</h3>
              </div>
              <div className="p-2 bg-[#ef4444]/10 rounded-lg text-[#ef4444]"><TrendingDown size={20} /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#38bdf8]/5 border-[#38bdf8]/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-[#94a3b8]">Lợi nhuận ròng</p>
                <h3 className="text-2xl font-bold text-[#38bdf8] mt-1">{profit.toLocaleString()}đ</h3>
              </div>
              <div className="p-2 bg-[#38bdf8]/10 rounded-lg text-[#38bdf8]"><DollarSign size={20} /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Growth */}
        <Card>
          <div className="px-6 py-4 border-b border-[#334155] bg-[#0f172a]/50 flex justify-between items-center">
            <h3 className="font-bold text-[#f8fafc]">Doanh thu 6 tháng gần nhất</h3>
            <div className="flex gap-2 text-xs">
              <label className="flex items-center gap-1 text-[#94a3b8] cursor-pointer hover:text-[#f8fafc]">
                 <input type="checkbox" checked={showLabels} onChange={e => setShowLabels(e.target.checked)} className="rounded border-[#334155] bg-transparent text-[#38bdf8] focus:ring-[#38bdf8]/50" /> Nhãn
              </label>
              <label className="flex items-center gap-1 text-[#94a3b8] cursor-pointer hover:text-[#f8fafc]">
                 <input type="checkbox" checked={showTrendline} onChange={e => setShowTrendline(e.target.checked)} className="rounded border-[#334155] bg-transparent text-[#f59e0b] focus:ring-[#f59e0b]/50" /> Xu hướng
              </label>
            </div>
          </div>
          <CardContent className="p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={financialData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorThu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <filter id="shadow" height="130%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.3"/>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={formatNumber} dx={-10} />
                <Tooltip 
                  formatter={(value: number) => `${value.toLocaleString()} đ`}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Bar dataKey="thu" name="Doanh thu" fill="url(#colorThu)" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {showLabels && <LabelList dataKey="thu" position="top" formatter={formatNumber} fill="#f8fafc" fontSize={10} fontWeight="bold" dy={-5} />}
                </Bar>
                {showTrendline && (
                  <>
                    <Area type="monotone" dataKey="thu" fill="url(#colorTrend)" stroke="none" />
                    <Line type="monotone" dataKey="thu" name="Xu hướng" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: "#1e293b", strokeWidth: 2, stroke: "#f59e0b" }} activeDot={{ r: 6 }} filter="url(#shadow)" />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <div className="px-6 py-4 border-b border-[#334155] bg-[#0f172a]/50 flex justify-between items-center">
            <h3 className="font-bold text-[#f8fafc]">Cơ cấu Chi phí</h3>
            <div className="flex bg-[#1e293b] p-0.5 rounded border border-[#334155]">
               <button 
                 onClick={() => setPieFormat('value')}
                 className={`px-2 py-1 text-[10px] rounded transition-colors ${pieFormat === 'value' ? 'bg-[#38bdf8]/20 text-[#38bdf8] font-bold' : 'text-[#94a3b8] hover:text-[#f8fafc]'}`}
               >Số tiền</button>
               <button 
                 onClick={() => setPieFormat('percent')}
                 className={`px-2 py-1 text-[10px] rounded transition-colors ${pieFormat === 'percent' ? 'bg-[#38bdf8]/20 text-[#38bdf8] font-bold' : 'text-[#94a3b8] hover:text-[#f8fafc]'}`}
               >Tỷ lệ %</button>
            </div>
          </div>
          <CardContent className="p-6 h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {expenseCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => {
                     if (pieFormat === 'percent' && totalExpenseFiltered > 0) {
                        return [((value / totalExpenseFiltered) * 100).toFixed(1) + '%', name];
                     }
                     return [`${value.toLocaleString()} đ`, name];
                  }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/3 space-y-2">
              {expenseCategoryData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-xs text-[#94a3b8]">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Report */}
        <Card className="lg:col-span-2">
          <div className="px-6 py-4 border-b border-[#334155] bg-[#0f172a]/50 flex justify-between items-center">
            <h3 className="font-bold text-[#f8fafc] flex items-center gap-2"><DollarSign size={16} /> Báo cáo Doanh thu</h3>
            <span className="text-xs text-[#94a3b8]">{filteredInvoices.filter(i => i.status === 'paid').length} khoản thu</span>
          </div>
          <CardContent className="p-0">
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-[#0f172a] text-[#94a3b8] text-xs uppercase sticky top-0">
                  <tr>
                    <th className="px-6 py-3 font-medium">Kỳ thu</th>
                    <th className="px-6 py-3 font-medium">Phòng</th>
                    <th className="px-6 py-3 font-medium">Đơn giá phòng</th>
                    <th className="px-6 py-3 font-medium">Tổng thu</th>
                    <th className="px-6 py-3 font-medium">Ngày nhận tiền</th>
                    <th className="px-6 py-3 font-medium">Hình thức</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {filteredInvoices.filter(i => i.status === 'paid').map(inv => (
                    <tr key={inv.id} className="text-sm border-b border-[#334155]/50 hover:bg-[#334155]/10">
                       <td className="px-6 py-3 text-[#94a3b8]">{inv.month}</td>
                       <td className="px-6 py-3 text-[#f8fafc] font-medium">P.{rooms.find(r => r.id === inv.roomId)?.number}</td>
                       <td className="px-6 py-3 text-[#f8fafc]">{inv.rent.toLocaleString()}đ</td>
                       <td className="px-6 py-3 text-[#10b981] font-bold">{inv.total.toLocaleString()}đ</td>
                       <td className="px-6 py-3 text-[#94a3b8]">{inv.paymentDate || '-'}</td>
                       <td className="px-6 py-3">
                         {inv.paymentMethod === 'cash' ? <Badge variant="warning">Tiền mặt</Badge> : <Badge variant="info">Chuyển khoản</Badge>}
                       </td>
                    </tr>
                  ))}
                  {filteredInvoices.filter(i => i.status === 'paid').length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[#94a3b8] italic">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance History */}
        <Card className="lg:col-span-2">
          <div className="px-6 py-4 border-b border-[#334155] bg-[#0f172a]/50 flex justify-between items-center">
            <h3 className="font-bold text-[#f8fafc] flex items-center gap-2"><Wrench size={16} /> Báo cáo Danh mục Bảo trì</h3>
            <span className="text-xs text-[#94a3b8]">{maintenanceHistory.length} lệnh bảo trì</span>
          </div>
          <CardContent className="p-0">
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-[#0f172a] text-[#94a3b8] text-xs uppercase sticky top-0">
                  <tr>
                    <th className="px-6 py-3 font-medium">Báo cáo</th>
                    <th className="px-6 py-3 font-medium">Phòng</th>
                    <th className="px-6 py-3 font-medium">Sự cố</th>
                    <th className="px-6 py-3 font-medium">Nội dung / Tình trạng</th>
                    <th className="px-6 py-3 font-medium">Ngày xử lý</th>
                    <th className="px-6 py-3 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {maintenanceHistory.map(h => (
                    <tr key={h.id} className="text-sm border-b border-[#334155]/50 hover:bg-[#334155]/10">
                      <td className="px-6 py-3 text-[#94a3b8]">{h.createdAt}</td>
                      <td className="px-6 py-3 text-[#f8fafc] font-medium">{h.roomId === 'elevator' ? 'Thang máy' : h.roomId === 'other' ? 'Khác' : `P.${rooms.find(r => r.id === h.roomId)?.number || h.roomId}`}</td>
                      <td className="px-6 py-3 text-[#f8fafc]">{h.title}</td>
                      <td className="px-6 py-3 text-[#94a3b8] truncate max-w-[200px]" title={h.description}>{h.description}</td>
                      <td className="px-6 py-3 text-[#ef4444] font-medium">{h.dueDate || '-'}</td>
                      <td className="px-6 py-3">
                        <Badge variant={h.status === 'resolved' ? 'success' : h.status === 'in-progress' ? 'info' : 'warning'}>
                          {h.status === 'resolved' ? 'Đã xong' : h.status === 'in-progress' ? 'Đang sửa' : 'Mới'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Cleaning History */}
        <Card>
          <div className="px-6 py-4 border-b border-[#334155] bg-[#0f172a]/50 flex justify-between items-center">
            <h3 className="font-bold text-[#f8fafc] flex items-center gap-2"><Sparkles size={16} /> Lịch sử Dọn dẹp</h3>
            <span className="text-xs text-[#94a3b8]">{cleaningHistory.length} lượt dọn dẹp</span>
          </div>
          <CardContent className="p-0">
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-[#0f172a] text-[#94a3b8] text-xs uppercase sticky top-0">
                  <tr>
                    <th className="px-6 py-3 font-medium">Ngày</th>
                    <th className="px-6 py-3 font-medium">Phòng</th>
                    <th className="px-6 py-3 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {cleaningHistory.map(h => (
                    <tr key={h.id} className="text-sm border-b border-[#334155]/50 hover:bg-[#334155]/10">
                      <td className="px-6 py-3 text-[#94a3b8]">{h.createdAt}</td>
                      <td className="px-6 py-3 text-[#f8fafc] font-medium">P.{rooms.find(r => r.id === h.roomId)?.number}</td>
                      <td className="px-6 py-3"><Badge variant="success">Hoàn tất</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Re-using local button for within-view actions
function Button({ children, variant = 'primary', size = 'md', className = '', ...props }: any) {
  const variants = {
    primary: "bg-[#38bdf8] text-[#0f172a] hover:opacity-90",
    outline: "border border-[#334155] text-[#94a3b8] hover:bg-[#334155]",
  };
  const sizes = {
    sm: "px-2 py-1 text-[10px]",
    md: "px-4 py-2",
  };
  return (
    <button className={`inline-flex items-center justify-center font-bold rounded transition-colors ${variants[variant as keyof typeof variants]} ${sizes[size as keyof typeof sizes]} ${className}`} {...props}>
      {children}
    </button>
  );
}
