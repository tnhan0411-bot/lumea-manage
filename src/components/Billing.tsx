import React, { useState } from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardHeader, CardContent, Badge, Button } from './ui';
import { FormEvent } from 'react';

export function Billing() {
  const { role, invoices, rooms, tenants, payInvoice } = useAppContext();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const myInvoices = role === 'tenant' 
    ? invoices.filter(i => i.tenantId === 't1') 
    : invoices;

  const displayInvoices = activeTab === 'pending'
    ? myInvoices.filter(i => i.status !== 'paid')
    : myInvoices.filter(i => i.status === 'paid');

  const handlePay = (id: string) => {
    if(window.confirm('Xác nhận thanh toán qua Momo/ZaloPay?')) {
      payInvoice(id);
      alert('Thanh toán thành công!');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#f8fafc]">
          {role === 'landlord' ? 'Quản lý Thu Chi' : 'Hóa đơn & Thanh toán'}
        </h1>
        {role === 'landlord' && <Button>Tạo hóa đơn mới</Button>}
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
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#0f172a]/50 uppercase text-[#94a3b8] text-xs tracking-wider border-b border-[#334155]">
            <tr>
              <th className="px-6 py-4 font-medium">Kỳ Thu</th>
              {role === 'landlord' && <th className="px-6 py-4 font-medium">Phòng / Người thuê</th>}
              <th className="px-6 py-4 font-medium">Chi tiết chi phí</th>
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
                <tr key={inv.id} className="hover:bg-[#334155]/30">
                  <td className="px-6 py-4 font-medium text-[#f8fafc]">Tháng {inv.month}</td>
                  {role === 'landlord' && (
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#f8fafc] text-base">Phòng {room?.number}</p>
                      <p className="text-[#94a3b8] text-xs">{tenant?.name}</p>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="text-xs text-[#94a3b8] space-y-1">
                      <p>Tiền phòng: {inv.rent.toLocaleString()}đ</p>
                      <p>Tiền điện: {inv.electricity.toLocaleString()}đ</p>
                      <p>Tiền nước: {inv.water.toLocaleString()}đ</p>
                      {inv.other > 0 && <p>Khác: {inv.other.toLocaleString()}đ</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#10b981] text-base">{inv.total.toLocaleString()}đ</span>
                    {inv.status !== 'paid' && <p className="text-xs text-[#94a3b8] mt-1">Hạn: {inv.dueDate}</p>}
                  </td>
                  <td className="px-6 py-4">
                    {inv.status === 'paid' ? <Badge variant="success">Đã thu</Badge> : 
                     inv.status === 'overdue' ? <Badge variant="danger">Quá hạn</Badge> : 
                     <Badge variant="warning">Chờ thu</Badge>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {inv.status !== 'paid' && role === 'tenant' && (
                      <Button size="sm" onClick={() => handlePay(inv.id)}>Thanh toán ngay</Button>
                    )}
                    {inv.status !== 'paid' && role === 'landlord' && (
                      <Button variant="outline" size="sm" onClick={() => payInvoice(inv.id)}>Đánh dấu Đã Thu</Button>
                    )}
                    {inv.status === 'paid' && (
                       <Button variant="ghost" size="sm">Xem biên lai</Button>
                    )}
                  </td>
                </tr>
              );
            })}
            
            {displayInvoices.length === 0 && (
              <tr>
                <td colSpan={role === 'landlord' ? 6 : 5} className="px-6 py-12 text-center text-[#94a3b8]">
                  Không có hóa đơn nào trong mục này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
