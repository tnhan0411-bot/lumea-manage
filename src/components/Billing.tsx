import React, { useState } from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardHeader, CardContent, Badge, Button } from './ui';
import { Receipt, Calendar, Clock, Trash2, Edit2 } from 'lucide-react';
import { FormEvent } from 'react';

export function Billing() {
  const { role, invoices, rooms, tenants, payInvoice, expenses, checkMonthlyBilling, updateInvoice, updateRoom, deleteInvoice } = useAppContext();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [isGenerating, setIsGenerating] = useState(false);

  const [editingElecId, setEditingElecId] = useState<string | null>(null);
  const [tempInitMeter, setTempInitMeter] = useState<number | ''>('');
  const [tempFinalMeter, setTempFinalMeter] = useState<number | ''>('');

  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  const [tempIssueDate, setTempIssueDate] = useState<string>('');
  const [tempMonth, setTempMonth] = useState<string>('');

  const [editingFullId, setEditingFullId] = useState<string | null>(null);
  const [tempFullInvoice, setTempFullInvoice] = useState<any>(null);

  const handleEditFull = (inv: any) => {
    setEditingFullId(inv.id);
    setTempFullInvoice({ ...inv });
  };

  const handleSaveFull = async () => {
    if (!tempFullInvoice) return;
    const { rent, electricity, water, other } = tempFullInvoice;
    const total = rent + electricity + water + other;
    await updateInvoice(tempFullInvoice.id, { ...tempFullInvoice, total });
    setEditingFullId(null);
    setTempFullInvoice(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hóa đơn này? Thao tác này không thể hoàn tác.')) {
      await deleteInvoice(id);
    }
  };

  const handleEditDate = (inv: any) => {
     setEditingDateId(inv.id);
     setTempIssueDate(inv.issueDate || new Date().toISOString().split('T')[0]);
     setTempMonth(inv.month || '');
  };

  const handleSaveDate = async (id: string) => {
     await updateInvoice(id, { issueDate: tempIssueDate, month: tempMonth });
     setEditingDateId(null);
  };

  const handleEditElec = (inv: any) => {
    setEditingElecId(inv.id);
    setTempInitMeter(inv.initialElectricityMeter ?? '');
    setTempFinalMeter(inv.finalElectricityMeter ?? '');
  };

  const handleSaveElec = async (inv: any) => {
    const init = Number(tempInitMeter) || 0;
    const final = Number(tempFinalMeter) || 0;
    const electricityAmount = Math.max(0, final - init) * 4000;
    const newTotal = inv.rent + electricityAmount + inv.water + inv.other;
    await updateInvoice(inv.id, { 
      initialElectricityMeter: init, 
      finalElectricityMeter: final, 
      electricity: electricityAmount,
      total: newTotal
    });
    await updateRoom(inv.roomId, { initialElectricityMeter: final });
    setEditingElecId(null);
  };


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

  const [selectedMethod, setSelectedMethod] = useState<Record<string, 'cash' | 'transfer'>>({});
  const [selectedPaymentDate, setSelectedPaymentDate] = useState<Record<string, string>>({});

  const handlePay = async (id: string) => {
    if(window.confirm('Xác nhận thanh toán?')) {
      await payInvoice(id, 'transfer');
    }
  };

  const handleLandlordPay = async (id: string) => {
    const method = selectedMethod[id] || 'transfer';
    const payDate = selectedPaymentDate[id] || new Date().toISOString().split('T')[0];
    if(window.confirm(`Xác nhận đã thu tiền (${method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}) vào ngày ${payDate}?`)) {
      await payInvoice(id, method, payDate);
    }
  };

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
                      {editingFullId === inv.id ? (
                        <div className="flex flex-col gap-2 mt-1 min-w-[200px] bg-[#0f172a] p-3 rounded-lg border border-[#38bdf8]">
                           <div>
                              <label className="text-[9px] text-[#94a3b8] uppercase font-bold">Kỳ hạn (YYYY-MM)</label>
                              <input type="text" className="w-full bg-[#1e293b] border border-[#334155] rounded px-2 py-1 text-xs text-[#f8fafc]" value={tempFullInvoice.month} onChange={e => setTempFullInvoice({...tempFullInvoice, month: e.target.value})} />
                           </div>
                           <div>
                              <label className="text-[9px] text-[#94a3b8] uppercase font-bold">Ngày lập</label>
                              <input type="date" className="w-full bg-[#1e293b] border border-[#334155] rounded px-2 py-1 text-xs text-[#f8fafc]" value={tempFullInvoice.issueDate} onChange={e => setTempFullInvoice({...tempFullInvoice, issueDate: e.target.value})} />
                           </div>
                           <div>
                              <label className="text-[9px] text-[#94a3b8] uppercase font-bold">Hạn đóng</label>
                              <input type="date" className="w-full bg-[#1e293b] border border-[#334155] rounded px-2 py-1 text-xs text-[#f8fafc]" value={tempFullInvoice.dueDate} onChange={e => setTempFullInvoice({...tempFullInvoice, dueDate: e.target.value})} />
                           </div>
                        </div>
                      ) : editingDateId === inv.id ? (
                        <div className="flex flex-col gap-2 mt-1">
                          <input type="text" placeholder="Tháng (YYYY-MM)" className="bg-[#1e293b] border border-[#334155] rounded px-2 py-1 text-[10px] text-[#f8fafc] outline-none" value={tempMonth} onChange={e => setTempMonth(e.target.value)} />
                          <input type="date" className="bg-[#1e293b] border border-[#334155] rounded px-2 py-1 text-[10px] text-[#f8fafc] outline-none" value={tempIssueDate} onChange={e => setTempIssueDate(e.target.value)} />
                          <div className="flex gap-2">
                             <Button size="sm" variant="outline" onClick={() => setEditingDateId(null)} className="h-6 text-[9px]">Hủy</Button>
                             <Button size="sm" onClick={() => handleSaveDate(inv.id)} className="h-6 text-[9px]">Lưu</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-[#94a3b8] flex flex-col gap-0.5 mt-1 relative">
                          <span className="font-bold text-[#f8fafc] cursor-pointer" onClick={() => handleEditDate(inv)}>Tháng {inv.month} {role === 'landlord' && <span className="text-[9px] text-[#38bdf8] opacity-50 ml-1 underline">Sửa kỳ</span>}</span>
                          <span className="flex items-center gap-1 group/date cursor-pointer" onClick={() => handleEditDate(inv)}>
                             <Calendar size={10} /> Ngày lập: {inv.issueDate || 'Chưa cập nhật'}
                             {role === 'landlord' && <span className="text-[9px] text-[#38bdf8] opacity-0 group-hover/date:opacity-100 ml-1 underline">Sửa ngày</span>}
                          </span>
                          <span className="flex items-center gap-1"><Calendar size={10} /> Hạn: {inv.dueDate}</span>
                        </div>
                      )}
                    </td>
                    {role === 'landlord' && (
                      <td className="px-6 py-4">
                        <p className="font-medium text-[#f8fafc]">Phòng {room?.number}</p>
                        <p className="text-[#94a3b8] text-xs">{tenant?.name}</p>
                      </td>
                    )}
                    <td className="px-6 py-4 min-w-[240px]">
                      {editingFullId === inv.id ? (
                         <div className="flex flex-col gap-2 bg-[#0f172a] p-3 rounded-lg border border-[#38bdf8]">
                            <div className="grid grid-cols-2 gap-2">
                               <div>
                                  <label className="text-[9px] text-[#94a3b8] uppercase font-bold">Tiền nhà</label>
                                  <input type="number" className="w-full bg-[#1e293b] border border-[#334155] rounded px-2 py-1 text-xs text-[#f8fafc]" value={tempFullInvoice.rent} onChange={e => setTempFullInvoice({...tempFullInvoice, rent: Number(e.target.value)})} />
                               </div>
                               <div>
                                  <label className="text-[9px] text-[#94a3b8] uppercase font-bold">Tiền điện</label>
                                  <input type="number" className="w-full bg-[#1e293b] border border-[#334155] rounded px-2 py-1 text-xs text-[#f8fafc]" value={tempFullInvoice.electricity} onChange={e => setTempFullInvoice({...tempFullInvoice, electricity: Number(e.target.value)})} />
                               </div>
                               <div>
                                  <label className="text-[9px] text-[#94a3b8] uppercase font-bold">Tiền nước</label>
                                  <input type="number" className="w-full bg-[#1e293b] border border-[#334155] rounded px-2 py-1 text-xs text-[#f8fafc]" value={tempFullInvoice.water} onChange={e => setTempFullInvoice({...tempFullInvoice, water: Number(e.target.value)})} />
                               </div>
                               <div>
                                  <label className="text-[9px] text-[#94a3b8] uppercase font-bold">Khác</label>
                                  <input type="number" className="w-full bg-[#1e293b] border border-[#334155] rounded px-2 py-1 text-xs text-[#f8fafc]" value={tempFullInvoice.other} onChange={e => setTempFullInvoice({...tempFullInvoice, other: Number(e.target.value)})} />
                               </div>
                            </div>
                            <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-[#334155]">
                               <Button variant="outline" size="sm" onClick={() => setEditingFullId(null)} className="h-7 text-[10px]">Hủy</Button>
                               <Button size="sm" onClick={handleSaveFull} className="h-7 text-[10px]">Lưu tất cả</Button>
                            </div>
                         </div>
                      ) : editingElecId === inv.id ? (
                        <div className="flex flex-col gap-2 bg-[#0f172a] p-3 rounded-lg border border-[#334155]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase text-[#94a3b8] font-bold">Số điện đầu</span>
                            <input type="number" className="w-20 bg-[#1e293b] rounded px-2 py-1 text-xs text-[#f8fafc] border border-[#334155] outline-none" value={tempInitMeter} onChange={e => setTempInitMeter(Number(e.target.value))} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase text-[#94a3b8] font-bold">Số điện cuối</span>
                            <input type="number" className="w-20 bg-[#1e293b] rounded px-2 py-1 text-xs text-[#f8fafc] border border-[#334155] outline-none" value={tempFinalMeter} onChange={e => setTempFinalMeter(Number(e.target.value))} />
                          </div>
                          <div className="flex gap-2 justify-end mt-2">
                            <Button variant="outline" size="sm" onClick={() => setEditingElecId(null)} className="h-7 text-[10px]">Hủy</Button>
                            <Button size="sm" onClick={() => handleSaveElec(inv)} className="h-7 text-[10px]">Lưu</Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="font-bold text-[#10b981] text-base">{inv.total.toLocaleString()}đ</span>
                          <div className="text-[10px] text-[#94a3b8] mt-1 space-y-0.5">
                            <p>Phòng: {inv.rent.toLocaleString()}đ</p>
                            <div className="flex items-center gap-2 group/elec">
                              <p>
                                Điện: {inv.electricity.toLocaleString()}đ 
                                {inv.finalElectricityMeter ? ` (${inv.finalElectricityMeter} - ${inv.initialElectricityMeter || 0})` : ''}
                              </p>
                              {role === 'landlord' && inv.status !== 'paid' && (
                                <button onClick={() => handleEditElec(inv)} className="text-[#38bdf8] opacity-0 group-hover/elec:opacity-100 transition-opacity">
                                  {inv.finalElectricityMeter ? 'Sửa số' : 'Chốt số'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {inv.status === 'paid' ? <Badge variant="success">Đã thu</Badge> : 
                       inv.status === 'overdue' ? <Badge variant="danger">Quá hạn</Badge> : 
                       <Badge variant="warning">Chờ thu</Badge>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.status !== 'paid' && role === 'landlord' && editingFullId !== inv.id && (
                        <div className="flex items-center justify-end gap-2 mb-2">
                           <button 
                             onClick={() => handleEditFull(inv)}
                             className="p-1.5 text-[#38bdf8] hover:bg-[#38bdf8]/10 rounded transition-colors"
                             title="Sửa chi tiết"
                           >
                             <Edit2 size={14} />
                           </button>
                           <button 
                             onClick={() => handleDelete(inv.id)}
                             className="p-1.5 text-[#ef4444] hover:bg-[#ef4444]/10 rounded transition-colors"
                             title="Xóa hóa đơn"
                           >
                             <Trash2 size={14} />
                           </button>
                        </div>
                      )}
                      {inv.status !== 'paid' && role === 'tenant' && (
                        <Button size="sm" onClick={() => handlePay(inv.id)}>Thanh toán</Button>
                      )}
                      {inv.status !== 'paid' && role === 'landlord' && (
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <input 
                              type="date"
                              className="bg-[#0f172a] border border-[#334155] rounded px-2 py-1 text-xs text-[#f8fafc] outline-none"
                              value={selectedPaymentDate[inv.id] || new Date().toISOString().split('T')[0]}
                              onChange={e => setSelectedPaymentDate({...selectedPaymentDate, [inv.id]: e.target.value})}
                              title="Ngày thanh toán"
                            />
                            <select 
                              className="bg-[#0f172a] border border-[#334155] rounded px-2 py-1 text-xs text-[#f8fafc] outline-none"
                              value={selectedMethod[inv.id] || 'transfer'}
                              onChange={e => setSelectedMethod({...selectedMethod, [inv.id]: e.target.value as 'cash'|'transfer'})}
                            >
                              <option value="transfer">Chuyển khoản</option>
                              <option value="cash">Tiền mặt</option>
                            </select>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleLandlordPay(inv.id)}>Đánh dấu Thu</Button>
                        </div>
                      )}
                      {inv.status === 'paid' && (
                        <div className="flex items-center justify-end gap-2">
                          <div className="flex flex-col items-end mr-2">
                             {inv.paymentMethod && <span className="text-[10px] text-[#94a3b8] uppercase">{inv.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}</span>}
                             {inv.paymentDate && <span className="text-[10px] text-[#38bdf8]">{inv.paymentDate}</span>}
                          </div>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">Biên lai</Button>
                        </div>
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
