import React from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardContent, Badge } from './ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wrench, Sparkles, Receipt, FileBarChart } from 'lucide-react';

export function Reports() {
  const { invoices, expenses, issues, rooms } = useAppContext();

  // Calculate monthly stats (Mocking some values for trending if data is thin)
  const monthlyRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((acc, inv) => acc + inv.total, 0);

  const monthlyExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  
  const profit = monthlyRevenue - monthlyExpenses;

  // Chart Data
  const financialData = [
    { name: 'T2', thu: 45000000, chi: 12000000 },
    { name: 'T3', thu: 48000000, chi: 15000000 },
    { name: 'T4', thu: monthlyRevenue, chi: monthlyExpenses },
  ];

  const expenseCategoryData = [
    { name: 'Điện', value: expenses.filter(e => e.category === 'electricity').reduce((a, b) => a + b.amount, 0) },
    { name: 'Nước', value: expenses.filter(e => e.category === 'water').reduce((a, b) => a + b.amount, 0) },
    { name: 'Bảo trì', value: expenses.filter(e => e.category === 'maintenance').reduce((a, b) => a + b.amount, 0) },
    { name: 'Nhân sự', value: expenses.filter(e => e.category === 'staff').reduce((a, b) => a + b.amount, 0) },
  ].filter(d => d.value > 0);

  const COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#ef4444'];

  const maintenanceHistory = issues.filter(i => i.status === 'resolved' && i.type === 'repair');
  const cleaningHistory = issues.filter(i => i.status === 'resolved' && i.type === 'cleaning');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#f8fafc] flex items-center gap-2">
          <FileBarChart className="text-[#38bdf8]" /> Báo cáo Tổng hợp
        </h1>
        <div className="flex gap-2">
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
                <p className="text-sm font-medium text-[#94a3b8]">Tổng Doanh thu (Tháng này)</p>
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
                <p className="text-sm font-medium text-[#94a3b8]">Tổng Chi phí (Tháng này)</p>
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
                <p className="text-sm font-medium text-[#94a3b8]">Lợi nhuận Thuần</p>
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
          <div className="px-6 py-4 border-b border-[#334155] bg-[#0f172a]/50">
            <h3 className="font-bold text-[#f8fafc]">Xu hướng Tài chính (3 tháng)</h3>
          </div>
          <CardContent className="p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Bar dataKey="thu" name="Doanh thu" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="chi" name="Chi phí" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <div className="px-6 py-4 border-b border-[#334155] bg-[#0f172a]/50">
            <h3 className="font-bold text-[#f8fafc]">Cơ cấu Chi phí</h3>
          </div>
          <CardContent className="p-6 h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
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
        {/* Maintenance History */}
        <Card>
          <div className="px-6 py-4 border-b border-[#334155] bg-[#0f172a]/50 flex justify-between items-center">
            <h3 className="font-bold text-[#f8fafc] flex items-center gap-2"><Wrench size={16} /> Lịch sử Bảo trì</h3>
            <span className="text-xs text-[#94a3b8]">{maintenanceHistory.length} mục hoàn thành</span>
          </div>
          <CardContent className="p-0">
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-[#0f172a] text-[#94a3b8] text-xs uppercase sticky top-0">
                  <tr>
                    <th className="px-6 py-3 font-medium">Ngày</th>
                    <th className="px-6 py-3 font-medium">Phòng</th>
                    <th className="px-6 py-3 font-medium">Nội dung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {maintenanceHistory.map(h => (
                    <tr key={h.id} className="text-sm border-b border-[#334155]/50 hover:bg-[#334155]/10">
                      <td className="px-6 py-3 text-[#94a3b8]">{h.createdAt}</td>
                      <td className="px-6 py-3 text-[#f8fafc] font-medium">P.{rooms.find(r => r.id === h.roomId)?.number}</td>
                      <td className="px-6 py-3 text-[#f8fafc]">{h.title}</td>
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
