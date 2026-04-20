import React, { useState } from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardContent, Button, Badge } from './ui';
import { Zap, Droplets, Trash2, Search, Plus, Save, History, FileText, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export function Utilities() {
  const { rooms, utilities, addUtility, role } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  // Form states
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [eIndex, setEIndex] = useState('');
  const [wIndex, setWIndex] = useState('');
  const [electricityPrice, setElectricityPrice] = useState('3500');
  const [waterPrice, setWaterPrice] = useState('15000');
  const [trashPrice, setTrashPrice] = useState('50000');

  const filteredRooms = rooms.filter(r => r.number.includes(searchTerm));

  const handleSave = () => {
    if (!activeRoomId) return;
    
    // Simple calculation logic
    const eAmount = Number(eIndex) * Number(electricityPrice);
    const wAmount = Number(wIndex) * Number(waterPrice);
    const total = eAmount + wAmount + Number(trashPrice);

    addUtility({
      id: `ut-${Date.now()}`,
      roomId: activeRoomId,
      month,
      electricity: { index: Number(eIndex), pricePerUnit: Number(electricityPrice), amount: eAmount },
      water: { index: Number(wIndex), pricePerUnit: Number(waterPrice), amount: wAmount },
      trash: Number(trashPrice),
      total,
      recordedAt: new Date().toISOString().split('T')[0]
    });

    setActiveRoomId(null);
    setEIndex('');
    setWIndex('');
  };

  const getRecordForMonth = (roomId: string, monthStr: string) => {
    return utilities.find(u => u.roomId === roomId && u.month === monthStr);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc]">Báo cáo Điện, Nước & Rác</h1>
          <p className="text-sm text-[#94a3b8]">Ghi chỉ số và quản lý chi phí tiện ích hàng tháng</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="month" 
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2 text-sm text-[#f8fafc] focus:ring-2 focus:ring-[#38bdf8] outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room List Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" size={18} />
            <input 
              type="text" 
              placeholder="Tìm số phòng..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#f8fafc] outline-none focus:ring-2 focus:ring-[#38bdf8]"
            />
          </div>

          <div className="bg-[#1e293b]/50 border border-[#334155] rounded-xl overflow-hidden divide-y divide-[#334155]">
            {filteredRooms.map(room => {
               const record = getRecordForMonth(room.id, month);
               const isActive = activeRoomId === room.id;
               return (
                 <button 
                  key={room.id}
                  onClick={() => setActiveRoomId(room.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 transition-colors text-left",
                    isActive ? "bg-[#38bdf8]/10" : "hover:bg-[#334155]/20"
                  )}
                 >
                   <div className="flex items-center gap-3">
                     <div className={cn(
                       "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                       record ? "bg-[#10b981]/10 text-[#10b981]" : "bg-[#334155] text-[#94a3b8]"
                     )}>
                       {room.number}
                     </div>
                     <div>
                        <p className="text-sm font-bold text-[#f8fafc]">Phòng {room.number}</p>
                        <p className="text-[11px] text-[#94a3b8]">{record ? `Đã ghi: ${record.total.toLocaleString()}đ` : 'Chưa có chỉ số'}</p>
                     </div>
                   </div>
                   <ChevronRight size={16} className={cn("transition-transform", isActive ? "rotate-90 text-[#38bdf8]" : "text-[#334155]")} />
                 </button>
               );
            })}
          </div>
        </div>

        {/* Entry Form or View */}
        <div className="lg:col-span-2 space-y-6">
          {activeRoomId ? (() => {
            const room = rooms.find(r => r.id === activeRoomId);
            const record = getRecordForMonth(activeRoomId, month);
            
            return (
              <Card className="border-[#38bdf8]/30">
                <div className="px-6 py-4 border-b border-[#334155] flex justify-between items-center bg-[#38bdf8]/5">
                  <h3 className="font-bold text-[#f8fafc]">Nhập chỉ số - Phòng {room?.number} (tháng {month})</h3>
                  <Badge variant={record ? 'success' : 'warning'}>{record ? 'Đã hoàn thành' : 'Đang xử lý'}</Badge>
                </div>
                <CardContent className="p-6">
                  {record ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-[#0f172a] rounded-xl border border-[#334155]">
                          <div className="flex items-center gap-2 text-[#38bdf8] mb-2">
                             <Zap size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Điện</span>
                          </div>
                          <p className="text-xl font-bold text-[#f8fafc]">{record.electricity.index} kWh</p>
                          <p className="text-xs text-[#94a3b8] mt-1">{record.electricity.amount.toLocaleString()}đ</p>
                        </div>
                        <div className="p-4 bg-[#0f172a] rounded-xl border border-[#334155]">
                          <div className="flex items-center gap-2 text-blue-400 mb-2">
                             <Droplets size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Nước</span>
                          </div>
                          <p className="text-xl font-bold text-[#f8fafc]">{record.water.index} m³</p>
                          <p className="text-xs text-[#94a3b8] mt-1">{record.water.amount.toLocaleString()}đ</p>
                        </div>
                        <div className="p-4 bg-[#0f172a] rounded-xl border border-[#334155]">
                          <div className="flex items-center gap-2 text-[#ef4444] mb-2">
                             <Trash2 size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Rác</span>
                          </div>
                          <p className="text-xl font-bold text-[#f8fafc]">{record.trash.toLocaleString()}đ</p>
                          <p className="text-xs text-[#94a3b8] mt-1">Cố định</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-[#334155] flex justify-between items-center">
                         <div>
                            <p className="text-sm text-[#94a3b8]">Tổng chi phí tiện ích</p>
                            <p className="text-2xl font-bold text-[#10b981]">{record.total.toLocaleString()}đ</p>
                         </div>
                         <Button variant="outline" onClick={() => setActiveRoomId(null)}>Đóng</Button>
                      </div>
                    </div>
                  ) : role === 'landlord' ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <label className="flex items-center gap-2 text-sm font-bold text-[#f8fafc]">
                            <Zap size={16} className="text-[#38bdf8]" /> Chỉ số Điện (kWh)
                          </label>
                          <input 
                            type="number"
                            value={eIndex}
                            onChange={e => setEIndex(e.target.value)}
                            placeholder="Vd: 1250"
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-3 text-[#f8fafc] outline-none focus:ring-2 focus:ring-[#38bdf8]"
                          />
                          <div className="flex items-center justify-between text-xs text-[#94a3b8]">
                            <span>Đơn giá: {Number(electricityPrice).toLocaleString()}đ</span>
                            <span>Thành tiền: {(Number(eIndex) * Number(electricityPrice)).toLocaleString()}đ</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="flex items-center gap-2 text-sm font-bold text-[#f8fafc]">
                            <Droplets size={16} className="text-blue-400" /> Chỉ số Nước (m³)
                          </label>
                          <input 
                            type="number"
                            value={wIndex}
                            onChange={e => setWIndex(e.target.value)}
                            placeholder="Vd: 85"
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-3 text-[#f8fafc] outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          <div className="flex items-center justify-between text-xs text-[#94a3b8]">
                            <span>Đơn giá: {Number(waterPrice).toLocaleString()}đ</span>
                            <span>Thành tiền: {(Number(wIndex) * Number(waterPrice)).toLocaleString()}đ</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-[#38bdf8]/5 rounded-xl border border-[#38bdf8]/10 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-[#f8fafc]">Tiền rác & Dịch vụ (VND)</span>
                          <input 
                            type="number"
                            value={trashPrice}
                            onChange={e => setTrashPrice(e.target.value)}
                            className="bg-transparent border-b border-[#334155] text-right text-[#f8fafc] focus:border-[#38bdf8] outline-none"
                          />
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-[#334155]">
                           <span className="font-bold text-[#f8fafc]">TỔNG THU</span>
                           <span className="text-xl font-bold text-[#38bdf8]">
                             {(Number(eIndex)*Number(electricityPrice) + Number(wIndex)*Number(waterPrice) + Number(trashPrice)).toLocaleString()}đ
                           </span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3">
                         <Button variant="outline" onClick={() => setActiveRoomId(null)}>Hủy</Button>
                         <Button onClick={handleSave} className="gap-2"><Save size={18} /> Lưu & Xuất Hóa đơn</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                       <FileText size={48} className="mx-auto text-[#334155] mb-4" />
                       <p className="text-[#94a3b8]">Vui lòng đợi chủ nhà cập nhật chỉ số tháng này.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })() : (
            <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-[#334155] rounded-2xl bg-[#1e293b]/20">
               <Zap size={48} className="text-[#334155] mb-4" />
               <p className="text-[#94a3b8] font-medium">Chọn một phòng để xem hoặc nhập chỉ số</p>
            </div>
          )}

          {/* History / Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
               <CardContent className="p-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><History size={20} /></div>
                    <span className="text-sm font-medium text-[#f8fafc]">Đã ghi chỉ số</span>
                 </div>
                 <span className="text-xl font-bold text-[#f8fafc]">{utilities.filter(u => u.month === month).length}/{rooms.length}</span>
               </CardContent>
            </Card>
            <Card>
               <CardContent className="p-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#38bdf8]/10 text-[#38bdf8] rounded-lg"><Zap size={20} /></div>
                    <span className="text-sm font-medium text-[#f8fafc]">Tổng tiêu thụ tháng</span>
                 </div>
                 <span className="text-xl font-bold text-[#f8fafc]">
                   {utilities.filter(u => u.month === month).reduce((s, c) => s + c.electricity.index, 0).toLocaleString()} kWh
                 </span>
               </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
