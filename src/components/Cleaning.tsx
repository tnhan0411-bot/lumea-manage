import React, { useState } from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardHeader, CardContent, Badge, Button } from './ui';
import { Sparkles, CheckCircle, Calendar, Clock, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function Cleaning() {
  const { role, issues, addIssue, updateIssue, rooms, deleteIssue } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [roomId, setRoomId] = useState(rooms[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [note, setNote] = useState('');

  const cleaningTasks = issues.filter(i => i.type === 'cleaning');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addIssue({
      id: `clean-${Date.now()}`,
      roomId,
      title: `Dọn dẹp định kỳ`,
      description: note || `Lịch dọn vệ sinh lúc ${time}`,
      status: 'open',
      createdAt: date,
      type: 'cleaning'
    });
    setNote('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc]">Lịch Vệ sinh Phòng</h1>
          <p className="text-[#94a3b8] text-sm">Theo dõi giờ giấc và ngày dọn dẹp theo từng phòng.</p>
        </div>
        {role === 'landlord' && (
          <Button onClick={() => {
            setShowForm(!showForm);
            if (!showForm) setNote('');
          }}>
            {showForm ? 'Hủy' : '+ Lên lịch dọn dẹp'}
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="bg-[#10b981]/5 border-[#10b981]/20 border-dashed">
          <CardContent className="p-6">
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Chọn phòng</label>
                  <select 
                    value={roomId}
                    onChange={e => setRoomId(e.target.value)}
                    className="w-full rounded-lg bg-[#0f172a] border-[#334155] text-[#f8fafc] border p-2 text-sm"
                  >
                    {rooms.map(r => <option key={r.id} value={r.id}>Phòng {r.number}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Ngày dọn</label>
                  <input 
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full rounded-lg bg-[#0f172a] border-[#334155] text-[#f8fafc] border p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Giờ dọn</label>
                  <input 
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full rounded-lg bg-[#0f172a] border-[#334155] text-[#f8fafc] border p-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Ghi chú / Yêu cầu đặc biệt</label>
                  <input 
                    type="text"
                    placeholder="Ví dụ: Thay ga giường, dọn kỹ nhà vệ sinh..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="w-full rounded-lg bg-[#0f172a] border-[#334155] text-[#f8fafc] border p-2 text-sm"
                  />
                </div>
                <Button type="submit" className="h-[38px] px-8">Xác nhận</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => {
          const roomTasks = cleaningTasks.filter(t => t.roomId === room.id);
          const nextTask = roomTasks.find(t => t.status === 'open');
          const lastCompleted = [...roomTasks].reverse().find(t => t.status === 'resolved');

          return (
            <Card key={room.id} className={cn(
              "hover:border-[#38bdf8]/50 transition-all border-t-4",
              nextTask ? "border-t-[#fbbf24]" : "border-t-[#10b981]"
            )}>
              <CardHeader 
                title={`Phòng ${room.number}`}
                action={
                  <Badge variant={room.status === 'occupied' ? 'info' : 'ghost'}>
                    {room.status === 'occupied' ? 'Đang ở' : 'Trống'}
                  </Badge>
                }
              />
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Lịch dọn tiếp theo</span>
                  {nextTask ? (
                    <div className="flex items-center gap-3 p-3 bg-[#fbbf24]/10 rounded-xl border border-[#fbbf24]/20">
                      <Clock size={16} className="text-[#fbbf24]" />
                      <div>
                        <p className="text-xs font-bold text-[#f8fafc]">{nextTask.createdAt}</p>
                        <p className="text-[10px] text-[#94a3b8]">{nextTask.description}</p>
                      </div>
                      {role !== 'tenant' && (
                        <button 
                          onClick={() => updateIssue(nextTask.id, 'resolved')}
                          className="ml-auto p-1.5 bg-[#fbbf24] text-[#0f172a] rounded-lg hover:opacity-80 transition-opacity"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-[#64748b] italic">Chưa có lịch.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Lần cuối hoàn thành</span>
                  {lastCompleted ? (
                    <div className="flex items-center gap-3 text-xs text-[#10b981]">
                      <CheckCircle size={14} />
                      <span>{lastCompleted.createdAt} - {lastCompleted.description}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-[#64748b] italic">Chưa có dữ liệu.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
