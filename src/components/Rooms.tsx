import React, { useState } from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardContent, Badge, Button } from './ui';
import { User, Check, Clock, X, Save, FileText, Plus, Trash2, Calendar, Paperclip } from 'lucide-react';
import { Room, cn, Attachment } from '../lib/utils';

export function RoomList() {
  const { rooms, tenants, issues, updateRoom, updateTenant } = useAppContext();
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [tempRoom, setTempRoom] = useState<Room | null>(null);
  const [tempTenantName, setTempTenantName] = useState('');
  const [newCleaningDate, setNewCleaningDate] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState('');

  const handleEditClick = (room: Room) => {
    setEditingRoomId(room.id);
    setTempRoom({ ...room });
    const tenant = tenants.find(t => t.roomId === room.id);
    setTempTenantName(tenant ? tenant.name : '');
  };

  const handleSave = () => {
    if (tempRoom) {
      updateRoom(tempRoom.id, { 
        number: tempRoom.number, 
        price: tempRoom.price,
        status: tempRoom.status,
        cleaningSchedule: tempRoom.cleaningSchedule,
        attachments: tempRoom.attachments
      });
      const tenant = tenants.find(t => t.roomId === tempRoom.id);
      if (tenant) {
        updateTenant(tenant.id, { name: tempTenantName });
      }
    }
    setEditingRoomId(null);
  };

  const addCleaningDate = () => {
    if (newCleaningDate && tempRoom) {
      setTempRoom({
        ...tempRoom,
        cleaningSchedule: [...tempRoom.cleaningSchedule, newCleaningDate].sort((a, b) => b.localeCompare(a))
      });
      setNewCleaningDate('');
    }
  };

  const removeCleaningDate = (date: string) => {
    if (tempRoom) {
      setTempRoom({
        ...tempRoom,
        cleaningSchedule: tempRoom.cleaningSchedule.filter(d => d !== date)
      });
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
        <Button>Thêm phòng</Button>
      </div>

      {editingRoomId && tempRoom && (
        <Card className="border-2 border-[#38bdf8] bg-[#1e293b] mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#f8fafc]">Cấu hình Phòng {tempRoom.number}</h2>
              <button onClick={() => setEditingRoomId(null)} className="text-[#94a3b8] hover:text-[#f8fafc]">
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#38bdf8] uppercase tracking-wider flex items-center gap-2">
                   <User size={16} /> Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-1">Số phòng</label>
                    <input 
                      type="text" 
                      value={tempRoom.number}
                      onChange={e => setTempRoom({...tempRoom, number: e.target.value})}
                      className="w-full bg-[#0f172a] border-[#334155] rounded-lg p-2 text-[#f8fafc] focus:ring-2 focus:ring-[#38bdf8] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-1">Giá thuê (VNĐ)</label>
                    <input 
                      type="number" 
                      value={tempRoom.price}
                      onChange={e => setTempRoom({...tempRoom, price: Number(e.target.value)})}
                      className="w-full bg-[#0f172a] border-[#334155] rounded-lg p-2 text-[#f8fafc] focus:ring-2 focus:ring-[#38bdf8] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-1">Người thuê</label>
                    <input 
                      type="text" 
                      value={tempTenantName}
                      onChange={e => setTempTenantName(e.target.value)}
                      disabled={tempRoom.status === 'available'}
                      className="w-full bg-[#0f172a] border-[#334155] rounded-lg p-2 text-[#f8fafc] focus:ring-2 focus:ring-[#38bdf8] outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-1">Trạng thái</label>
                    <select 
                      value={tempRoom.status}
                      onChange={e => setTempRoom({...tempRoom, status: e.target.value as Room['status']})}
                      className="w-full bg-[#0f172a] border-[#334155] rounded-lg p-2 text-[#f8fafc] focus:ring-2 focus:ring-[#38bdf8] outline-none"
                    >
                      <option value="occupied">Đang thuê</option>
                      <option value="available">Trống</option>
                      <option value="maintenance">Bảo trì</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cleaning Schedule */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#10b981] uppercase tracking-wider flex items-center gap-2">
                   <Calendar size={16} /> Lịch dọn vệ sinh
                </h3>
                <div className="flex gap-2 mb-4">
                  <input 
                    type="date"
                    value={newCleaningDate}
                    onChange={e => setNewCleaningDate(e.target.value)}
                    className="flex-1 bg-[#0f172a] border-[#334155] rounded-lg p-2 text-[#f8fafc] text-sm"
                  />
                  <Button size="sm" onClick={addCleaningDate}><Plus size={16} /></Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {tempRoom.cleaningSchedule.map(date => (
                    <div key={date} className="flex justify-between items-center bg-[#0f172a] p-2 rounded border border-[#334155]">
                      <span className="text-sm text-[#f8fafc]">{date}</span>
                      <button onClick={() => removeCleaningDate(date)} className="text-[#ef4444] hover:text-[#ef4444]/80">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {tempRoom.cleaningSchedule.length === 0 && (
                    <p className="text-xs text-[#94a3b8] italic text-center py-4">Chưa có lịch dọn dẹp</p>
                  )}
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#f59e0b] uppercase tracking-wider flex items-center gap-2">
                   <Paperclip size={16} /> Hồ sơ & File đính kèm
                </h3>
                <div className="flex gap-2 mb-4">
                  <input 
                    type="text"
                    placeholder="Tên file..."
                    value={newAttachmentName}
                    onChange={e => setNewAttachmentName(e.target.value)}
                    className="flex-1 bg-[#0f172a] border-[#334155] rounded-lg p-2 text-[#f8fafc] text-sm"
                  />
                  <Button size="sm" onClick={addAttachment}><Plus size={16} /></Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {tempRoom.attachments.map(att => (
                    <div key={att.id} className="flex justify-between items-center bg-[#0f172a] p-2 rounded border border-[#334155]">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText size={14} className="text-[#38bdf8] shrink-0" />
                        <span className="text-sm text-[#f8fafc] truncate">{att.name}</span>
                      </div>
                      <button onClick={() => removeAttachment(att.id)} className="text-[#ef4444] hover:text-[#ef4444]/80">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {tempRoom.attachments.length === 0 && (
                    <p className="text-xs text-[#94a3b8] italic text-center py-4">Chưa có file đính kèm</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#334155] flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingRoomId(null)}>Hủy</Button>
              <Button onClick={handleSave} className="gap-2 px-8">
                <Save size={18} /> Lưu cấu hình
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                
                <div className="flex-1 mt-2">
                  <p className="font-medium text-[13px] text-[#f8fafc]">
                    {tenant ? tenant.name : <span className="text-[#94a3b8] italic">Sẵn sàng</span>}
                  </p>
                  <p className="text-[11px] text-[#94a3b8] mt-1">{room.price.toLocaleString()}đ</p>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="flex gap-2">
                    {roomIssues.length > 0 && (
                      <div className="w-6 h-6 rounded bg-white/5 border border-[#ef4444] text-[#ef4444] flex items-center justify-center text-xs" title={`${roomIssues.length} sự cố`}>
                        🛠️
                      </div>
                    )}
                    {(room.status === 'occupied' || room.cleaningSchedule.length > 0) && (
                      <div className="w-6 h-6 rounded bg-white/5 border border-[#10b981] text-[#10b981] flex items-center justify-center text-xs" title="Lịch dọn dẹp">
                        🧹
                      </div>
                    )}
                    {room.attachments.length > 0 && (
                      <div className="w-6 h-6 rounded bg-white/5 border border-[#38bdf8] text-[#38bdf8] flex items-center justify-center text-xs" title="Hồ sơ">
                        📎
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[#38bdf8] font-bold">CLICK ĐỂ SỬA</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
