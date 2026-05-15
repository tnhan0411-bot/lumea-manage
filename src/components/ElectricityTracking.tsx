import React, { useState } from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardContent, Badge } from './ui';
import { Zap, Search, Calendar } from 'lucide-react';
import { cn, formatVND } from '../lib/utils';

export function ElectricityTracking() {
  const { rooms, tenants, invoices } = useAppContext();
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const filteredInvoices = invoices.filter(inv => inv.month === selectedMonth);

  const trackingData = rooms
    .filter(room => {
      // Show if currently occupied OR has an invoice for this month
      const hasInvoice = filteredInvoices.some(inv => inv.roomId === room.id);
      return room.status === 'occupied' || hasInvoice;
    })
    .map(room => {
      const invoice = filteredInvoices.find(inv => inv.roomId === room.id);
      const tenant = tenants.find(t => t.id === (invoice?.tenantId || (room.status === 'occupied' ? tenants.find(t2 => t2.roomId === room.id)?.id : '')));
      
      const initial = invoice?.initialElectricityMeter ?? room.initialElectricityMeter ?? 0;
      const final = invoice?.finalElectricityMeter ?? 0;
      const used = Math.max(0, final - initial);
      const amount = used * 4000;
      
      return {
        roomNumber: room.number,
        tenantName: tenant?.name || (room.status === 'occupied' ? (tenants.find(t => t.roomId === room.id)?.name || 'N/A') : 'N/A'),
        initial,
        final,
        used,
        amount,
        isChot: !!invoice?.finalElectricityMeter,
        status: invoice?.status
      };
    })
    .filter(item => 
      item.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.tenantName.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc]">Theo dõi tiền điện</h1>
          <p className="text-[#94a3b8] text-sm">Quản lý chỉ số điện và tiền điện hàng tháng của từng phòng.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" size={16} />
            <input 
              type="text" 
              placeholder="Tìm phòng, khách hàng..." 
              className="bg-[#1e293b] border border-[#334155] rounded-xl pl-10 pr-4 py-2 text-sm text-[#f8fafc] outline-none focus:ring-2 focus:ring-[#38bdf8] w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 flex items-center gap-2">
            <Calendar size={16} className="text-[#38bdf8]" />
            <input 
              type="month" 
              className="bg-transparent text-sm text-[#f8fafc] outline-none"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card className="bg-[#1e293b] border-[#334155]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#0f172a]/50 uppercase text-[#94a3b8] text-xs tracking-wider border-b border-[#334155]">
                <tr>
                  <th className="px-6 py-4 font-medium">Số phòng</th>
                  <th className="px-6 py-4 font-medium">Người thuê</th>
                  <th className="px-6 py-4 font-medium">Số chữ điện đầu</th>
                  <th className="px-6 py-4 font-medium">Số chữ điện cuối</th>
                  <th className="px-6 py-4 font-medium">Số điện thực dùng</th>
                  <th className="px-6 py-4 font-medium text-right">Khách thực trả (4.000đ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]/50">
                {trackingData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#334155]/30 transition-colors group">
                    <td className="px-6 py-4 font-bold text-[#f8fafc]">
                      Phòng {item.roomNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[#f8fafc] font-medium">{item.tenantName}</p>
                    </td>
                    <td className="px-6 py-4 text-[#94a3b8]">
                      {item.initial}
                    </td>
                    <td className="px-6 py-4">
                      {item.isChot ? (
                        <span className="text-[#38bdf8] font-medium">{item.final}</span>
                      ) : (
                        <span className="text-[#64748b] italic text-xs">Chưa chốt số (0)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#f8fafc]">
                      {item.used} kWh
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-base font-bold text-[#10b981]">{formatVND(item.amount)}</p>
                      {item.status === 'paid' && <Badge variant="success" className="text-[9px] mt-1">Đã thanh toán</Badge>}
                    </td>
                  </tr>
                ))}
                {trackingData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#94a3b8] italic">
                      Không có dữ liệu tiêu thụ điện trong tháng {selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#38bdf8]/5 border-[#38bdf8]/20 text-[#f8fafc]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Tổng tiêu thụ</p>
              <p className="text-2xl font-bold text-[#38bdf8] mt-1">
                {trackingData.reduce((sum, item) => sum + item.used, 0)} kWh
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#38bdf8]/10 flex items-center justify-center text-[#38bdf8]">
              <Zap size={20} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#10b981]/5 border-[#10b981]/20 text-[#f8fafc]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Tổng tiền điện</p>
              <p className="text-2xl font-bold text-[#10b981] mt-1">
                {formatVND(trackingData.reduce((sum, item) => sum + item.amount, 0))}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
              <Zap size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#fbbf24]/5 border-[#fbbf24]/20 text-[#f8fafc]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Phòng chưa chốt số</p>
              <p className="text-2xl font-bold text-[#fbbf24] mt-1">
                {trackingData.filter(item => !item.isChot).length} / {rooms.filter(r => r.status === 'occupied').length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#fbbf24]/10 flex items-center justify-center text-[#fbbf24]">
              <Zap size={20} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
