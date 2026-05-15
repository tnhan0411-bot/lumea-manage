import React, { useState, useEffect } from 'react';
import { useAppContext, db } from '../lib/context';
import { Card, CardContent, Badge, Button } from './ui';
import { Zap, Search, Calendar, Save, FileText } from 'lucide-react';
import { cn, formatVND } from '../lib/utils';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function ElectricityTracking() {
  const { rooms, tenants, invoices, updateInvoice, addInvoice } = useAppContext();
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [totalBuildingElectricity, setTotalBuildingElectricity] = useState<number>(0);

  // Editable local state for rows before saving
  const [editedData, setEditedData] = useState<Record<string, { initial: string, final: string }>>({});

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const d = await getDoc(doc(db, 'state', 'electricity_meta'));
        if (d.exists()) {
          setTotalBuildingElectricity(d.data()[selectedMonth] || 0);
        } else {
          setTotalBuildingElectricity(0);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchMeta();
  }, [selectedMonth]);

  const handleTotalBuildingChange = async (val: string) => {
    const num = parseInt(val) || 0;
    setTotalBuildingElectricity(num);
    try {
      await setDoc(doc(db, 'state', 'electricity_meta'), { [selectedMonth]: num }, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };

  const filteredInvoices = invoices.filter(inv => inv.month === selectedMonth);

  const baseTrackingData = rooms
    .filter(room => {
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
        roomId: room.id,
        invoiceId: invoice?.id,
        tenantId: tenant?.id || '',
        roomNumber: room.number,
        tenantName: tenant?.name || (room.status === 'occupied' ? (tenants.find(t => t.roomId === room.id)?.name || 'N/A') : 'N/A'),
        initial,
        final,
        used,
        amount,
        isChot: !!invoice?.finalElectricityMeter,
        status: invoice?.status || 'pending',
        electricityCharge: invoice?.electricity || 0
      };
    });

  // Calculate Landlord stats
  const totalGuestUsed = baseTrackingData.reduce((sum, item) => sum + item.used, 0);
  const landlordUsed = Math.max(0, totalBuildingElectricity - totalGuestUsed);

  // Handle local edits
  const handleEdit = (roomId: string, field: 'initial' | 'final', value: string) => {
    setEditedData(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [field]: value
      }
    }));
  };

  const saveRow = (roomId: string) => {
    const edit = editedData[roomId];
    if (!edit) return;
    
    let initialNum = parseInt(edit.initial);
    let finalNum = parseInt(edit.final);
    
    const trackingItem = baseTrackingData.find(d => d.roomId === roomId);
    if (!trackingItem) return;

    if (isNaN(initialNum)) initialNum = trackingItem.initial;
    if (isNaN(finalNum)) finalNum = trackingItem.final;

    const used = Math.max(0, finalNum - initialNum);
    const cost = used * 4000;

    if (trackingItem.invoiceId) {
      updateInvoice(trackingItem.invoiceId, {
        initialElectricityMeter: initialNum,
        finalElectricityMeter: finalNum,
        electricity: cost,
        total: cost + (filteredInvoices.find(v => v.id === trackingItem.invoiceId)?.total || 0) - (filteredInvoices.find(v => v.id === trackingItem.invoiceId)?.electricity || 0)
      });
    } else {
      // Create invoice just for electricity if it doesn't exist
      const newInvoiceId = `inv-${roomId}-${Date.now()}`;
      addInvoice({
        id: newInvoiceId,
        roomId: roomId,
        tenantId: trackingItem.tenantId,
        month: selectedMonth,
        rent: 0,
        electricity: cost,
        initialElectricityMeter: initialNum,
        finalElectricityMeter: finalNum,
        water: 0,
        other: 0,
        total: cost,
        status: 'pending',
        dueDate: selectedMonth + '-05'
      });
    }

    // Clear edit state for this row
    setEditedData(prev => {
      const copy = { ...prev };
      delete copy[roomId];
      return copy;
    });
  };

  const toggleStatus = (roomId: string, invoiceId: string | undefined, currentStatus: string) => {
    if (!invoiceId) return; // Need an invoice to toggle status
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    const paymentDate = newStatus === 'paid' ? new Date().toISOString().split('T')[0] : undefined;
    const paymentMethod = newStatus === 'paid' ? 'cash' : undefined;
    updateInvoice(invoiceId, { status: newStatus, paymentDate, paymentMethod });
  };

  const trackingData = baseTrackingData.filter(item => 
    item.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
    item.tenantName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc]">Theo dõi tiền điện</h1>
          <p className="text-[#94a3b8] text-sm">Quản lý và chốt chỉ số điện hàng tháng.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" size={16} />
            <input 
              type="text" 
              placeholder="Tìm phòng..." 
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

      {/* DASHBOARDS MOVED TO TOP */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#1e293b] border-[#334155]">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-2">Tổng điện tiêu thụ của tháng</p>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={totalBuildingElectricity || ''} 
                onChange={(e) => handleTotalBuildingChange(e.target.value)} 
                className="bg-[#0f172a] border border-[#334155] text-2xl font-bold text-[#f8fafc] rounded-lg px-3 py-1 w-full outline-none focus:border-[#38bdf8]"
                placeholder="0"
              />
              <span className="text-sm font-bold text-[#94a3b8]">kWh</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#38bdf8]/5 border-[#38bdf8]/20 text-[#f8fafc]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Điện Khách Sử Dụng</p>
              <p className="text-2xl font-bold text-[#38bdf8] mt-1">
                {totalGuestUsed} kWh
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#38bdf8]/10 flex items-center justify-center text-[#38bdf8]">
              <Zap size={20} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#ef4444]/5 border-[#ef4444]/20 text-[#f8fafc]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Điện Landlord</p>
              <p className="text-2xl font-bold text-[#ef4444] mt-1">
                {landlordUsed} kWh
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#ef4444]/10 flex items-center justify-center text-[#ef4444]">
              <Zap size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#10b981]/5 border-[#10b981]/20 text-[#f8fafc]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Doanh thu điện (Khách trả)</p>
              <p className="text-2xl font-bold text-[#10b981] mt-1">
                {formatVND(baseTrackingData.filter(d => d.status === 'paid').reduce((sum, item) => sum + item.amount, 0))}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
              <Zap size={20} />
            </div>
          </CardContent>
        </Card>
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
                  <th className="px-6 py-4 font-medium">Khách thực trả (4.000đ)</th>
                  <th className="px-6 py-4 font-medium">Thu tiền</th>
                  <th className="px-6 py-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]/50">
                {trackingData.map((item) => {
                  const isEditing = editedData[item.roomId] !== undefined;
                  const currentInitial = isEditing ? editedData[item.roomId].initial : item.initial.toString();
                  const currentFinal = isEditing ? editedData[item.roomId].final : (item.final === 0 && !item.isChot ? '' : item.final.toString());
                  
                  return (
                    <tr key={item.roomId} className="hover:bg-[#334155]/30 transition-colors group">
                      <td className="px-6 py-4 font-bold text-[#f8fafc]">
                        Phòng {item.roomNumber}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[#f8fafc] font-medium">{item.tenantName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="number"
                          value={currentInitial}
                          onChange={(e) => handleEdit(item.roomId, 'initial', e.target.value)}
                          className="bg-[#0f172a] border border-[#334155] rounded px-2 py-1 text-sm text-[#f8fafc] w-20 outline-none focus:border-[#38bdf8]"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="number"
                          value={currentFinal}
                          onChange={(e) => handleEdit(item.roomId, 'final', e.target.value)}
                          className="bg-[#0f172a] border border-[#334155] rounded px-2 py-1 text-sm text-[#f8fafc] w-20 outline-none focus:border-[#38bdf8]"
                          placeholder={item.isChot ? "" : "Chốt số"}
                        />
                      </td>
                      <td className="px-6 py-4 font-bold text-[#f8fafc]">
                        {item.used} kWh
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-base font-bold text-[#10b981]">{formatVND(item.amount)}</p>
                      </td>
                      <td className="px-6 py-4">
                        {item.invoiceId ? (
                          <div className="flex items-center gap-2">
                             <Button 
                               size="sm" 
                               variant={item.status === 'paid' ? 'primary' : 'outline'}
                               className={cn("h-7 px-2 text-[10px]", item.status === 'paid' ? 'bg-[#10b981] hover:bg-[#059669] border-none text-white' : 'text-[#94a3b8]')}
                               onClick={() => toggleStatus(item.roomId, item.invoiceId, item.status)}
                             >
                               {item.status === 'paid' ? 'Đã thu' : 'Chưa thu'}
                             </Button>
                          </div>
                        ) : (
                          <span className="text-[#64748b] text-[10px] italic">Cần lưu số điện</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isEditing && (
                          <Button size="sm" onClick={() => saveRow(item.roomId)} className="h-7 px-3 bg-[#38bdf8] text-[#0f172a] hover:bg-[#0284c7]">
                            <Save size={14} className="mr-1" /> Lưu
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                
                {/* Landlord Row */}
                <tr className="bg-[#ef4444]/10 hover:bg-[#ef4444]/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-[#ef4444] border-t border-[#ef4444]/30">
                    Phòng Landlord
                  </td>
                  <td className="px-6 py-4 text-[#ef4444] italic border-t border-[#ef4444]/30">
                    Hệ thống tự tính
                  </td>
                  <td className="px-6 py-4 border-t border-[#ef4444]/30"></td>
                  <td className="px-6 py-4 border-t border-[#ef4444]/30"></td>
                  <td className="px-6 py-4 font-bold text-[#ef4444] border-t border-[#ef4444]/30">
                    {landlordUsed} kWh
                  </td>
                  <td className="px-6 py-4 text-[#ef4444] border-t border-[#ef4444]/30">
                    {formatVND(landlordUsed * 4000)}
                  </td>
                  <td className="px-6 py-4 border-t border-[#ef4444]/30"></td>
                  <td className="px-6 py-4 border-t border-[#ef4444]/30"></td>
                </tr>

                {trackingData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-[#94a3b8] italic">
                      Không có dữ liệu trong tháng {selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

