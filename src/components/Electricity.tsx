import React, { useState } from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardContent, Button, Badge } from './ui';
import { Zap, Calculator, Calendar } from 'lucide-react';
import { Room, ElectricityRecord } from '../lib/utils';

export function Electricity() {
  const { role, rooms, electricityRecords, addElectricityRecord, updateElectricityRecord, payElectricity } = useAppContext();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempInitMeter, setTempInitMeter] = useState<number | ''>('');
  const [tempFinalMeter, setTempFinalMeter] = useState<number | ''>('');

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const handleEdit = (record: ElectricityRecord) => {
    setEditingId(record.id);
    setTempInitMeter(record.initialMeter);
    setTempFinalMeter(record.finalMeter || '');
  };

  const handleSave = async (record: ElectricityRecord) => {
    const init = Number(tempInitMeter) || 0;
    const final = Number(tempFinalMeter) || 0;
    const usage = Math.max(0, final - init);
    const cost = usage * 4000; // 4000 VND per kWh
    
    await updateElectricityRecord(record.id, { 
      initialMeter: init, 
      finalMeter: final, 
      usage,
      cost
    });
    setEditingId(null);
  };

  const handleGenerateMonth = async () => {
    // Generate records for occupied rooms that don't have a record for this month
    const occupiedRooms = rooms.filter(r => r.status === 'occupied');
    for (const room of occupiedRooms) {
      const hasRecord = electricityRecords.some(e => e.roomId === room.id && e.month === currentMonth);
      if (!hasRecord) {
        // Find last record to get initial meter
        const lastRecords = electricityRecords.filter(e => e.roomId === room.id).sort((a, b) => b.month.localeCompare(a.month));
        const lastMeter = lastRecords.length > 0 && lastRecords[0].finalMeter ? lastRecords[0].finalMeter : (room.initialElectricityMeter || 0);

        await addElectricityRecord({
          id: `elec-${room.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          roomId: room.id,
          month: currentMonth,
          initialMeter: lastMeter,
          usage: 0,
          cost: 0,
          status: 'pending'
        });
      }
    }
  };

  const displayRecords = activeTab === 'pending'
    ? electricityRecords.filter(e => e.status === 'pending')
    : electricityRecords.filter(e => e.status === 'paid');

  const [selectedMethod, setSelectedMethod] = useState<Record<string, 'cash' | 'transfer'>>({});
  const [selectedPaymentDate, setSelectedPaymentDate] = useState<Record<string, string>>({});

  const handleLandlordPay = async (id: string) => {
    const method = selectedMethod[id] || 'transfer';
    const payDate = selectedPaymentDate[id] || new Date().toISOString().split('T')[0];
    if(window.confirm(`Xác nhận đã thu tiền điện (${method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}) vào ngày ${payDate}?`)) {
      await payElectricity(id, method, payDate);
    }
  };

  const unrecordedRooms = rooms.filter(room => 
    room.status === 'occupied' && 
    !electricityRecords.some(e => e.roomId === room.id && e.month === currentMonth)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc]">Quản lý Tiền Điện</h1>
          <p className="text-[#94a3b8] text-sm">Nhập và theo dõi số điện tiêu thụ theo từng tháng.</p>
        </div>
        {role === 'landlord' && unrecordedRooms.length > 0 && (
          <Button onClick={handleGenerateMonth} className="bg-[#10b981] text-white">
            <Calculator size={16} className="mr-2" />
            Khởi tạo tháng {currentMonth} ({unrecordedRooms.length} phòng)
          </Button>
        )}
      </div>

      <div className="flex gap-4 border-b border-[#334155]">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pending' ? 'border-[#38bdf8] text-[#38bdf8]' : 'border-transparent text-[#94a3b8] hover:text-[#f8fafc]'}`}
        >
          Đang chờ thu ({electricityRecords.filter(e => e.status === 'pending').length})
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-[#38bdf8] text-[#38bdf8]' : 'border-transparent text-[#94a3b8] hover:text-[#f8fafc]'}`}
        >
          Lịch sử thu điện
        </button>
      </div>

      <div className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#0f172a]/50 uppercase text-[#94a3b8] text-xs tracking-wider border-b border-[#334155]">
            <tr>
              <th className="px-6 py-4 font-medium">Tháng</th>
              <th className="px-6 py-4 font-medium">Phòng</th>
              <th className="px-6 py-4 font-medium">Chỉ số đầu/cuối</th>
              <th className="px-6 py-4 font-medium">Tiêu thụ / Thành tiền</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
              <th className="px-6 py-4 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]/50">
            {displayRecords.map((record) => {
              const room = rooms.find(r => r.id === record.roomId);
              return (
                <tr key={record.id} className="hover:bg-[#334155]/30">
                  <td className="px-6 py-4 font-bold">Tháng {record.month}</td>
                  <td className="px-6 py-4">Phòng {room?.number}</td>
                  <td className="px-6 py-4">
                    {editingId === record.id ? (
                      <div className="flex flex-col gap-2 bg-[#0f172a] p-2 rounded border border-[#334155] max-w-[200px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#94a3b8]">Số đầu:</span>
                          <input type="number" className="w-20 bg-[#1e293b] rounded px-1 py-0.5 text-xs text-white" value={tempInitMeter} onChange={e => setTempInitMeter(Number(e.target.value))} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#94a3b8]">Số cuối:</span>
                          <input type="number" className="w-20 bg-[#1e293b] border border-[#38bdf8] rounded px-1 py-0.5 text-xs text-white" value={tempFinalMeter} onChange={e => setTempFinalMeter(Number(e.target.value))} />
                        </div>
                        <div className="flex justify-end gap-2 mt-1">
                          <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => setEditingId(null)}>Hủy</Button>
                          <Button size="sm" className="h-6 text-[10px]" onClick={() => handleSave(record)}>Lưu</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col text-sm group">
                        <span>Đầu: {record.initialMeter}</span>
                        <span className="text-white">Cuối: {record.finalMeter || '?'}</span>
                        {role === 'landlord' && record.status === 'pending' && (
                          <button onClick={() => handleEdit(record)} className="text-[10px] text-[#38bdf8] opacity-0 group-hover:opacity-100 transition-opacity mt-1 text-left">
                            Sửa số liệu
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{record.usage} kWh</p>
                    <p className="text-[#10b981] font-bold mt-1 text-base">{record.cost.toLocaleString()}đ</p>
                  </td>
                  <td className="px-6 py-4">
                    {record.status === 'paid' ? <Badge variant="success">Đã thu</Badge> : <Badge variant="warning">Chờ thu</Badge>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {record.status === 'pending' && role === 'landlord' && (
                       <div className="flex flex-col items-end gap-2">
                         <div className="flex items-center gap-2">
                           <input 
                             type="date"
                             className="bg-[#0f172a] border border-[#334155] rounded px-2 py-1 text-xs text-[#f8fafc] outline-none"
                             value={selectedPaymentDate[record.id] || new Date().toISOString().split('T')[0]}
                             onChange={e => setSelectedPaymentDate({...selectedPaymentDate, [record.id]: e.target.value})}
                           />
                           <select 
                             className="bg-[#0f172a] border border-[#334155] rounded px-2 py-1 text-xs text-[#f8fafc] outline-none"
                             value={selectedMethod[record.id] || 'transfer'}
                             onChange={e => setSelectedMethod({...selectedMethod, [record.id]: e.target.value as 'cash'|'transfer'})}
                           >
                             <option value="transfer">Chuyển khoản</option>
                             <option value="cash">Tiền mặt</option>
                           </select>
                         </div>
                         <Button size="sm" variant="outline" onClick={() => handleLandlordPay(record.id)}>Thu tiền điện</Button>
                       </div>
                    )}
                    {record.status === 'paid' && (
                      <div className="text-[10px] text-[#94a3b8] flex flex-col items-end">
                        <span className="uppercase">{record.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}</span>
                        <span className="text-[#38bdf8]">{record.paymentDate}</span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {displayRecords.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#94a3b8]">Không có bản ghi nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
