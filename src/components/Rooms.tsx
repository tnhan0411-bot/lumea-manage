import React, { useState } from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardContent, Badge, Button } from './ui';
import { User, Check, Clock, X, Save, FileText, Plus, Trash2, Calendar, Paperclip, LogOut, Receipt } from 'lucide-react';
import { Room, cn, Attachment, formatDate, calculateRentForMonth } from '../lib/utils';

export function RoomList() {
  const { rooms, tenants, issues, invoices, updateRoom, updateTenant, addTenant, addRoom, deleteRoom, checkoutRoom, addInvoice, role } = useAppContext();
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [tempRoom, setTempRoom] = useState<Room | null>(null);
  const [tempTenantName, setTempTenantName] = useState('');
  const [tempPassportExpiry, setTempPassportExpiry] = useState('');
  const [tempPassportNumber, setTempPassportNumber] = useState('');
  const [tempSecondaryName, setTempSecondaryName] = useState('');
  const [tempSecondaryPassportExpiry, setTempSecondaryPassportExpiry] = useState('');
  const [tempSecondaryPassportNumber, setTempSecondaryPassportNumber] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const handleExportReport = () => {
    const headings = ['Số phòng', 'Trạng thái', 'Giá thuê', 'Người thuê 1', 'Hạn Visa 1', 'Người thuê 2', 'Hạn Visa 2', 'Bắt đầu thuê', 'Kết thúc thuê', 'Doanh thu (Đã thu)'];
    const rows = rooms.map(r => {
      const tenant = tenants.find(t => t.roomId === r.id);
      const roomRevenue = invoices
        .filter(inv => inv.roomId === r.id && inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total - (inv.electricity || 0), 0);
        
      return [
        r.number,
        r.status === 'occupied' ? 'Đang thuê' : r.status === 'available' ? 'Trống' : 'Bảo trì',
        r.price,
        tenant?.name || '',
        tenant?.visaExpiry || '',
        tenant?.secondaryName || '',
        tenant?.secondaryVisaExpiry || '',
        r.leaseStart || '',
        r.leaseEnd || '',
        roomRevenue
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headings.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bao_Cao_Phong_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const extendLease = (months: number) => {
    if (tempRoom) {
      let date = new Date();
      if (tempRoom.leaseEnd) {
        date = new Date(tempRoom.leaseEnd);
      }
      date.setMonth(date.getMonth() + months);
      setTempRoom({ ...tempRoom, leaseEnd: date.toISOString().split('T')[0] });
    }
  };

  const handleEditClick = (room: Room) => {
    if (role === 'tenant') return;
    setEditingRoomId(room.id);
    setTempRoom({ 
      ...room, 
      attachments: room.attachments || [], 
      features: room.features || [] 
    });
    const tenant = tenants.find(t => t.roomId === room.id);
    setTempTenantName(tenant ? tenant.name : '');
    setTempPassportExpiry(tenant?.visaExpiry || '');
    setTempPassportNumber(tenant?.passportNumber || '');
    setTempSecondaryName(tenant?.secondaryName || '');
    setTempSecondaryPassportExpiry(tenant?.secondaryVisaExpiry || '');
    setTempSecondaryPassportNumber(tenant?.secondaryPassportNumber || '');
  };

  const handleSave = async () => {
    if (tempRoom) {
      setIsSaving(true);
      try {
        // Ensure we pass all fields from tempRoom
        await updateRoom(tempRoom.id, { ...tempRoom });
        
        // Handle tenant detachment if room becomes available/maintenance
        if (tempRoom.status !== 'occupied') {
          const tenant = tenants.find(t => t.roomId === tempRoom.id);
          if (tenant) {
            await updateTenant(tenant.id, { roomId: "" });
          }
        } else {
          // Room is occupied
          const tenant = tenants.find(t => t.roomId === tempRoom.id);
          if (tenant) {
            await updateTenant(tenant.id, { 
              name: tempTenantName, 
              visaExpiry: tempPassportExpiry || "",
              passportNumber: tempPassportNumber || "",
              secondaryName: tempSecondaryName || "",
              secondaryVisaExpiry: tempSecondaryPassportExpiry || "",
              secondaryPassportNumber: tempSecondaryPassportNumber || "",
              contractEnd: tempRoom.leaseEnd || ""
            });
          } else if (tempTenantName) {
            // ... (keep the rest of adding tenant logic)
            // If no tenant exists but name is provided, create one
            const newTenantId = `t-${Date.now()}`;
            await addTenant({
              id: newTenantId,
              name: tempTenantName,
              roomId: tempRoom.id,
              phone: '',
              email: '',
              contractStart: tempRoom.leaseStart || new Date().toISOString().split('T')[0],
              contractEnd: tempRoom.leaseEnd || '',
              visaExpiry: tempPassportExpiry || "",
              passportNumber: tempPassportNumber || "",
              secondaryName: tempSecondaryName || "",
              secondaryVisaExpiry: tempSecondaryPassportExpiry || "",
              secondaryPassportNumber: tempSecondaryPassportNumber || "",
              residenceRegistered: false,
              secondaryResidenceRegistered: false
            });

            // Auto-generate invoice for the new stay
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            await addInvoice({
              id: `inv-${Date.now()}`,
              roomId: tempRoom.id,
              tenantId: newTenantId,
              month: currentMonth,
              rent: tempRoom.price,
              electricity: 0,
              water: 0,
              other: 0,
              total: tempRoom.price,
              status: 'pending',
              dueDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-05`,
              issueDate: now.toISOString().split('T')[0]
            });
          }
        }
        setEditingRoomId(null);
      } catch (error) {
        console.error("Error saving room data:", error);
        alert("Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleAddNewRoom = () => {
    const maxId = rooms.reduce((max, r) => {
      const num = parseInt(r.id.replace('r', ''));
      return num > max ? num : max;
    }, 0);
    const newId = `r${maxId + 1}`;
    const nextRoomNum = rooms.length > 0 ? (Math.max(...rooms.map(r => parseInt(r.number))) + 1).toString() : "101";

    addRoom({
      id: newId,
      number: nextRoomNum,
      status: 'available',
      price: 5000000,
      features: [],
      cleaningSchedule: [],
      attachments: []
    });
  };

  const handleCheckout = (id: string) => {
    if (window.confirm('Xác nhận trả phòng? Dữ liệu người thuê và thời hạn thuê sẽ được xóa để sẵn sàng cho khách mới.')) {
      checkoutRoom(id);
      setEditingRoomId(null);
    }
  };

  const handleDeleteRoom = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này khỏi hệ thống?')) {
      deleteRoom(id);
      setEditingRoomId(null);
    }
  };

  const addAttachment = () => {
    if (newAttachmentName && tempRoom) {
      const newAtt: Attachment = {
        id: `att-${Date.now()}`,
        name: newAttachmentName,
        url: '#',
        type: 'other',
        uploadedAt: new Date().toISOString().split('T')[0]
      };
      setTempRoom({
        ...tempRoom,
        attachments: [...tempRoom.attachments, newAtt]
      });
      setNewAttachmentName('');
    }
  };

  const removeAttachment = (id: string) => {
    if (tempRoom) {
      setTempRoom({
        ...tempRoom,
        attachments: tempRoom.attachments.filter(a => a.id !== id)
      });
    }
  };

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'occupied': return 'border-l-4 border-l-[#38bdf8] border-[#334155]';
      case 'available': return 'border-l-4 border-l-[#10b981] border-[#334155]';
      case 'maintenance': return 'border-l-4 border-l-[#ef4444] border-[#334155]';
    }
  };

  const getStatusBadge = (status: Room['status']) => {
    switch (status) {
      case 'occupied': return <span className="bg-[#38bdf8]/10 text-[#38bdf8] px-2 py-0.5 rounded text-[10px] uppercase font-bold">Đang thuê</span>;
      case 'available': return <span className="bg-[#10b981]/10 text-[#10b981] px-2 py-0.5 rounded text-[10px] uppercase font-bold">Trống</span>;
      case 'maintenance': return <Badge variant="danger">Bảo trì</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#f8fafc]">Quản lý Phòng</h1>
        <div className="flex gap-3">
           {role === 'landlord' && (
             <Button variant="outline" onClick={handleExportReport} className="gap-2">
               <FileText size={18} /> Xuất báo cáo
             </Button>
           )}
           {role === 'landlord' && <Button onClick={handleAddNewRoom}>Thêm phòng</Button>}
        </div>
      </div>

      {editingRoomId && tempRoom ? (
        <Card className="border-2 border-[#38bdf8] bg-[#1e293b] mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#f8fafc]">Cấu hình Phòng {tempRoom.number}</h2>
              <button onClick={() => setEditingRoomId(null)} className="text-[#94a3b8] hover:text-[#f8fafc]">
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#38bdf8] uppercase tracking-wider flex items-center gap-2">
                   <User size={16} /> Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#94a3b8] mb-1">Số phòng</label>
                      <input 
                        type="text" 
                        value={tempRoom.number || ''}
                        onChange={e => setTempRoom({...tempRoom, number: e.target.value})}
                        className="w-full bg-[#0f172a] border-[#334155] rounded-lg p-2 text-[#f8fafc] focus:ring-2 focus:ring-[#38bdf8] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#94a3b8] mb-1">Trạng thái</label>
                      <select 
                        value={tempRoom.status || 'available'}
                        onChange={e => setTempRoom({...tempRoom, status: e.target.value as Room['status']})}
                        className="w-full bg-[#0f172a] border-[#334155] rounded-lg p-2 text-[#f8fafc] focus:ring-2 focus:ring-[#38bdf8] outline-none"
                      >
                        <option value="occupied">Đang thuê</option>
                        <option value="available">Trống</option>
                        <option value="maintenance">Bảo trì</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-[#94a3b8] mb-1">Giá thuê (VNĐ)</label>
                    <input 
                      type="number" 
                      value={tempRoom.price || 0}
                      onChange={e => setTempRoom({...tempRoom, price: Number(e.target.value)})}
                      className="w-full bg-[#0f172a] border-[#334155] rounded-lg p-2 text-[#f8fafc] focus:ring-2 focus:ring-[#38bdf8] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-[#94a3b8] mb-1">Số điện đầu</label>
                    <input 
                      type="number" 
                      value={tempRoom.initialElectricityMeter || ''}
                      onChange={e => setTempRoom({...tempRoom, initialElectricityMeter: Number(e.target.value)})}
                      className="w-full bg-[#0f172a] border-[#334155] rounded-lg p-2 text-[#f8fafc] focus:ring-2 focus:ring-[#38bdf8] outline-none"
                    />
                  </div>
                  {tempRoom.status === 'occupied' && (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold text-[#94a3b8] mb-1">Người thuê 1</label>
                          <input 
                            type="text" 
                            name="tenantName"
                            value={tempTenantName}
                            onChange={e => setTempTenantName(e.target.value)}
                            className="w-full bg-[#0f172a] border-[#334155] rounded-lg p-2 text-[#f8fafc] focus:ring-2 focus:ring-[#38bdf8] outline-none text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold text-[#94a3b8] mb-1">Hộ chiếu 1</label>
                          <input 
                            type="text" 
                            value={tempPassportNumber}
                            onChange={e => setTempPassportNumber(e.target.value)}
                            className="w-full bg-[#0f172a] border-[#334155] rounded-lg p-2 text-[#f8fafc] focus:ring-2 focus:ring-[#38bdf8] outline-none text-xs"
                            placeholder="Số hộ chiếu"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold text-[#94a3b8] mb-1">Hạn Visa 1</label>
                          <input 
                            type="date" 
                            value={tempPassportExpiry}
                            onChange={e => setTempPassportExpiry(e.target.value)}
                            className="w-full bg-[#0f172a] border-[#334155] rounded-lg p-2 text-[#f8fafc] focus:ring-2 focus:ring-[#38bdf8] outline-none text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold text-[#94a3b8] mb-1">Người thuê 2</label>
                          <input 
                            type="text" 
                            value={tempSecondaryName}
                            onChange={e => setTempSecondaryName(e.target.value)}
                            className="w-full bg-[#0f172a] border-[#334155] rounded-lg p-2 text-[#f8fafc] focus:ring-2 focus:ring-[#38bdf8] outline-none text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold text-[#94a3b8] mb-1">Hộ chiếu 2</label>
                          <input 
                            type="text" 
                            value={tempSecondaryPassportNumber}
                            onChange={e => setTempSecondaryPassportNumber(e.target.value)}
                            className="w-full bg-[#0f172a] border-[#334155] rounded-lg p-2 text-[#f8fafc] focus:ring-2 focus:ring-[#38bdf8] outline-none text-xs"
                            placeholder="Số hộ chiếu"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold text-[#94a3b8] mb-1">Hạn Visa 2</label>
                          <input 
                            type="date" 
                            value={tempSecondaryPassportExpiry}
                            onChange={e => setTempSecondaryPassportExpiry(e.target.value)}
                            className="w-full bg-[#0f172a] border-[#334155] rounded-lg p-2 text-[#f8fafc] focus:ring-2 focus:ring-[#38bdf8] outline-none text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold text-[#94a3b8] mb-1">Ngày bắt đầu thuê</label>
                          <input 
                            type="date" 
                            value={tempRoom.leaseStart || ''}
                            onChange={e => setTempRoom({...tempRoom, leaseStart: e.target.value})}
                            className="w-full bg-[#0f172a] border-[#334155] rounded-lg p-2 text-[#f8fafc] text-xs focus:ring-2 focus:ring-[#38bdf8] outline-none"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] uppercase tracking-widest font-bold text-[#94a3b8]">Ngày hết hạn</label>
                            {tempRoom.status === 'occupied' && (
                               <div className="flex gap-1">
                                 <button type="button" onClick={() => extendLease(1)} className="text-[9px] bg-[#38bdf8]/10 text-[#38bdf8] px-1.5 py-0.5 rounded font-bold hover:bg-[#38bdf8]/20">+1T</button>
                                 <button type="button" onClick={() => extendLease(2)} className="text-[9px] bg-[#38bdf8]/10 text-[#38bdf8] px-1.5 py-0.5 rounded font-bold hover:bg-[#38bdf8]/20">+2T</button>
                                 <button type="button" onClick={() => extendLease(6)} className="text-[9px] bg-[#10b981]/10 text-[#10b981] px-1.5 py-0.5 rounded font-bold hover:bg-[#10b981]/20">Gia hạn 6T</button>
                                 <button type="button" onClick={() => extendLease(12)} className="text-[9px] bg-[#38bdf8]/10 text-[#38bdf8] px-1.5 py-0.5 rounded font-bold hover:bg-[#38bdf8]/20">Gia hạn 1N</button>
                               </div>
                            )}
                          </div>
                          <input 
                            type="date" 
                            value={tempRoom.leaseEnd || ''}
                            onChange={e => setTempRoom({...tempRoom, leaseEnd: e.target.value})}
                            className="w-full bg-[#0f172a] border-[#334155] rounded-lg p-2 text-[#f8fafc] text-xs focus:ring-2 focus:ring-[#38bdf8] outline-none"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#38bdf8] uppercase tracking-wider flex items-center gap-2">
                   <FileText size={16} /> Ghi chú phòng
                </h3>
                <textarea
                  value={tempRoom.note || ''}
                  onChange={e => setTempRoom({...tempRoom, note: e.target.value})}
                  className="w-full bg-[#0f172a] border-[#334155] rounded-lg p-2 text-[#f8fafc] focus:ring-2 focus:ring-[#38bdf8] outline-none text-xs min-h-[80px]"
                  placeholder="Thêm ghi chú đặc biệt cho phòng này..."
                ></textarea>
              </div>

            </div>
            
            <div className="mt-8 pt-6 border-t border-[#334155] flex justify-between items-center">
              <div className="flex gap-4 items-center">
                {role === 'landlord' && (
                  <button 
                    onClick={() => handleDeleteRoom(tempRoom.id)}
                    className="text-[#ef4444] text-xs font-bold flex items-center gap-2 hover:underline"
                  >
                    <Trash2 size={18} /> Xóa phòng
                  </button>
                )}
                {role === 'landlord' && tempRoom.status === 'occupied' && (
                  <button 
                    onClick={() => handleCheckout(tempRoom.id)}
                    className="text-[#f59e0b] text-xs font-bold flex items-center gap-2 hover:underline border-l border-[#334155] pl-4"
                  >
                    <LogOut size={18} /> Trả phòng
                  </button>
                )}
                {role === 'landlord' && tempRoom.status === 'occupied' && (
                  <button 
                    onClick={() => {
                        const now = new Date();
                        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                        
                        let calculatedRent = calculateRentForMonth(tempRoom.price, tempRoom.leaseStart, tempRoom.leaseEnd, currentMonth);

                        handleSave();
                        addInvoice({
                          id: `inv-${tempRoom.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                          roomId: tempRoom.id,
                          tenantId: tenants.find(t => t.roomId === tempRoom.id)?.id || 'unknown',
                          month: currentMonth,
                          rent: calculatedRent,
                          electricity: 0,
                          initialElectricityMeter: tempRoom.initialElectricityMeter,
                          water: 0,
                          other: 0,
                          total: calculatedRent,
                          status: 'pending',
                          dueDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-05`,
                          issueDate: now.toISOString().split('T')[0],
                          type: 'other',
                          createdAt: now.toISOString()
                        });
                        alert('Đã tạo hóa đơn cho phòng này!');
                    }}
                    className="text-[#10b981] text-xs font-bold flex items-center gap-2 hover:underline border-l border-[#334155] pl-4"
                  >
                    <Receipt size={18} /> Tạo hóa đơn
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setEditingRoomId(null)} disabled={isSaving}>Hủy</Button>
                <Button onClick={handleSave} className="gap-2 px-8" disabled={isSaving}>
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       Đang lưu...
                    </div>
                  ) : (
                    <>
                      <Save size={18} /> Lưu
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : editingRoomId ? (
          <div className="p-4 text-center text-red-500">Lỗi: Không tìm thấy dữ liệu phòng {editingRoomId}</div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {rooms.map(room => {
          const tenant = tenants.find(t => t.roomId === room.id);
          const roomIssues = issues.filter(i => i.roomId === room.id && i.status !== 'resolved');

          return (
            <Card key={room.id} className={cn("transition-all hover:bg-[#334155]/20 bg-[#1e293b] flex flex-col justify-between cursor-pointer", getStatusColor(room.status), editingRoomId === room.id && "ring-2 ring-[#38bdf8]")} onClick={() => handleEditClick(room)}>
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-[#f8fafc]">
                    P.{room.number}
                  </h3>
                  {getStatusBadge(room.status)}
                </div>
                
                <div className="flex-1 mt-2 space-y-1">
                  <p className="font-bold text-sm text-[#f8fafc]">
                    {tenant ? tenant.name : <span className="text-[#94a3b8] font-normal italic">Trống</span>}
                  </p>
                  <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-medium">{room.price.toLocaleString()}đ / tháng</p>
                  {room.leaseStart && room.leaseEnd && (
                    <div className="pt-2">
                      <p className="text-[10px] text-[#38bdf8] font-bold uppercase tracking-widest">Thời hạn thuê</p>
                      <p className="text-[11px] text-[#f8fafc] flex items-center gap-1 mt-0.5">
                        <Clock size={10} className="text-[#94a3b8]" />
                        {formatDate(room.leaseStart)} ➜ {formatDate(room.leaseEnd)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="flex gap-2">
                    {roomIssues.length > 0 && (
                      <div className="w-6 h-6 rounded bg-[#ef4444]/10 border border-[#ef4444]/30 flex items-center justify-center" title={`${roomIssues.length} sự cố`}>
                        <Clock size={12} className="text-[#ef4444]" />
                      </div>
                    )}
                  </div>
                  {role !== 'tenant' && <span className="text-[9px] text-[#38bdf8] font-bold tracking-widest">CHỈNH SỬA</span>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
