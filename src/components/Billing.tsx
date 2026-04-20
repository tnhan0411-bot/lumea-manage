import React, { useState } from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardHeader, CardContent, Badge, Button } from './ui';
import { Receipt, Calendar, Clock } from 'lucide-react';
import { FormEvent } from 'react';

export function Billing() {
  const { role, invoices, rooms, tenants, payInvoice, expenses, checkMonthlyBilling, payInvoice: updateInvoice } = useAppContext();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [isGenerating, setIsGenerating] = useState(false);

  const { pendingRooms, generateAll } = checkMonthlyBilling();

  const handleBulkGenerate = () => {
    setIsGenerating(true);
    generateAll();
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Đã tạo hóa đơn cho ${pendingRooms.length} phòng.`);
    }, 500);
  };

  const myInvoices = role === 'tenant' 
    ? invoices.filter(i => i.tenantId === 't1') 
    : invoices;

  const displayInvoices = activeTab === 'pending'
    ? myInvoices.filter(i => i.status !== 'paid')
    : myInvoices.filter(i => i.status === 'paid');

  const handlePay = (id: string) => {
    if(window.confirm('Xác nhận thanh toán?')) {
      payInvoice(id);
    }
  }

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const totalPending = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc]">
            {role === 'landlord' ? 'Quản lý Hóa đơn & Thu chi' : 'Hóa đơn & Thanh toán'}
          </h1>
          <p className="text-[#94a3b8] text-sm">Theo dõi doanh thu tiền phòng và dịch vụ hàng tháng.</p>
        </div>
        {role === 'landlord' && pendingRooms.length > 0 && (
          <Button 
            onClick={handleBulkGenerate} 
            disabled={isGenerating}
            className="bg-[#fbbf24] text-[#0f172a] hover:bg-[#fbbf24]/90 animate-pulse"
          >
            {isGenerating ? 'Đang tạo...' : `+ Tạo hóa đơn cho ${pendingRooms.length} phòng tới hạn`}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#10b981]/5 border-[#10b981]/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Doanh thu đã thu</p>
              <p className="text-2xl font-bold text-[#10b981] mt-1">{totalRevenue.toLocaleString()}đ</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
              <Receipt size={20} />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#fbbf24]/5 border-[#fbbf24]/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Tiền đang chờ thu</p>
              <p className="text-2xl font-bold text-[#fbbf24] mt-1">{totalPending.toLocaleString()}đ</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#fbbf24]/10 flex items-center justify-center text-[#fbbf24]">
              <Clock size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 border-b border-[#334155]">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pending' ? 'border-[#38bdf8] text-[#38bdf8]' : 'border-transparent text-[#94a3b8] hover:text-[#f8fafc]'}`}
        >
          Cần thanh toán ({myInvoices.filter(i => i.status !== 'paid').length})
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-[#38bdf8] text-[#38bdf8]' : 'border-transparent text-[#94a3b8] hover:text-[#f8fafc]'}`}
        >
          Lịch sử thanh toán
        </button>
      </div>

      <div className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0f172a]/50 uppercase text-[#94a3b8] text-xs tracking-wider border-b border-[#334155]">
              <tr>
                <th className="px-6 py-4 font-medium">Kỳ Thu</th>
                {role === 'landlord' && <th className="px-6 py-4 font-medium">Phòng / Người thuê</th>}
                <th className="px-6 py-4 font-medium">Tổng Tiền</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/50">
              {displayInvoices.map((inv) => {
                const room = rooms.find(r => r.id === inv.roomId);
                const tenant = tenants.find(t => t.id === inv.tenantId);

                return (
                  <tr key={inv.id} className="hover:bg-[#334155]/30 group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#f8fafc]">Tháng {inv.month}</p>
                      <p className="text-[10px] text-[#94a3b8] flex items-center gap-1">
                        <Calendar size={10} /> Hạn: {inv.dueDate}
                      </p>
                    </td>
                    {role === 'landlord' && (
                      <td className="px-6 py-4">
                        <p className="font-medium text-[#f8fafc]">Phòng {room?.number}</p>
                        <p className="text-[#94a3b8] text-xs">{tenant?.name}</p>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#10b981] text-base">{inv.total.toLocaleString()}đ</span>
                      <div className="text-[10px] text-[#64748b] mt-0.5">
                        P: {inv.rent.toLocaleString()} | Đ: {inv.electricity.toLocaleString()} | N: {inv.water.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {inv.status === 'paid' ? <Badge variant="success">Đã thu</Badge> : 
                       inv.status === 'overdue' ? <Badge variant="danger">Quá hạn</Badge> : 
                       <Badge variant="warning">Chờ thu</Badge>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.status !== 'paid' && role === 'tenant' && (
                        <Button size="sm" onClick={() => handlePay(inv.id)}>Thanh toán</Button>
                      )}
                      {inv.status !== 'paid' && role === 'landlord' && (
                        <Button variant="outline" size="sm" onClick={() => payInvoice(inv.id)}>Đánh dấu Thu</Button>
                      )}
                      {inv.status === 'paid' && (
                         <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">Biên lai</Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {displayInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#94a3b8] italic">
                    Không có hóa đơn nào trong mục này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
