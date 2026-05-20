import React, { useState } from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardHeader, CardContent, Badge, Button } from './ui';
import { CheckCircle, Clock, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { CleaningSchedule } from '../lib/utils';

export function Cleaning() {
  const { role, rooms, cleaningSchedules, addCleaningSchedule, updateCleaningSchedule, updateRoom } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) return;

    const newSchedule: CleaningSchedule = {
      id: `cs-${Date.now()}`,
      roomId: selectedRoomId,
      scheduledDate: date,
      scheduledTime: time,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    addCleaningSchedule(newSchedule);
    updateRoom(selectedRoomId, { cleanStatus: 'dirty' });
    setShowForm(false);
    setSelectedRoomId('');
  };

  const handleStartCleaning = (schedule: CleaningSchedule) => {
    updateCleaningSchedule(schedule.id, { status: 'in-progress' });
    updateRoom(schedule.roomId, { cleanStatus: 'cleaning' });
  };

  const handleFinishCleaning = (schedule: CleaningSchedule) => {
    updateCleaningSchedule(schedule.id, { status: 'completed' });
    updateRoom(schedule.roomId, { cleanStatus: 'clean' });
  };

  // Maintenance View (Technician / Housekeeping)
  if (role === 'technician') {
    const activeTasks = cleaningSchedules
      .filter(c => c.status !== 'completed')
      .sort((a, b) => new Date(`${a.scheduledDate}T${a.scheduledTime}`).getTime() - new Date(`${b.scheduledDate}T${b.scheduledTime}`).getTime());
      
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc]">Danh sách Công việc Dọn phòng</h1>
          <p className="text-[#94a3b8] text-sm">Danh sách các phòng cần được dọn dẹp, sắp xếp theo thời gian ưu tiên.</p>
        </div>
        
        {activeTasks.length === 0 ? (
          <div className="bg-[#1e293b] p-8 text-center rounded-xl border border-[#334155]">
            <CheckCircle className="mx-auto text-[#10b981] mb-2" size={32} />
            <p className="text-[#f8fafc] font-medium">Hiện tại không có lịch dọn phòng nào.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTasks.map(task => {
              const room = rooms.find(r => r.id === task.roomId);
              return (
                <Card key={task.id} className={cn("border-l-4", task.status === 'in-progress' ? "border-l-[#38bdf8]" : "border-l-[#f59e0b]")}>
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#0f172a] flex items-center justify-center border border-[#334155]">
                        <span className="font-bold text-[#f8fafc]">{room?.number}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock size={14} className="text-[#94a3b8]" />
                          <span className="text-sm font-medium text-[#e2e8f0]">{task.scheduledDate} lúc {task.scheduledTime}</span>
                        </div>
                        <Badge variant={task.status === 'in-progress' ? 'info' : 'warning'}>
                          {task.status === 'in-progress' ? 'Đang dọn dẹp' : 'Chờ dọn'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      {task.status === 'pending' ? (
                        <Button onClick={() => handleStartCleaning(task)} className="w-full md:w-auto bg-[#38bdf8] text-[#0f172a] hover:bg-[#0284c7]">
                          Bắt đầu dọn
                        </Button>
                      ) : (
                        <Button onClick={() => handleFinishCleaning(task)} className="w-full md:w-auto bg-[#10b981] text-[#0f172a] hover:bg-[#059669]">
                          Đã dọn xong
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Admin View
  const computeFloors = () => {
    const floorsMap: Record<string, typeof rooms> = {};
    rooms.forEach(room => {
      const floorStr = room.number.charAt(0);
      const floorName = `Tầng ${floorStr}`;
      if (!floorsMap[floorName]) floorsMap[floorName] = [];
      floorsMap[floorName].push(room);
    });
     // Sort keys
    return Object.keys(floorsMap).sort().map(key => ({ name: key, rooms: floorsMap[key] }));
  };

  const getRoomTask = (roomId: string) => {
     return cleaningSchedules.find(s => s.roomId === roomId && s.status !== 'completed');
  };

  const floors = computeFloors();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc]">Quản lý Lịch Vệ sinh</h1>
          <p className="text-[#94a3b8] text-sm">Giao diện phân bổ và theo dõi lịch dọn phòng theo thời gian thực.</p>
        </div>
      </div>

      {showForm && (
        <Card className="bg-[#10b981]/5 border-[#10b981]/20 border-dashed animate-in fade-in zoom-in duration-200">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-[#f8fafc] mb-4">Lên lịch / Gán lại lịch dọn dẹp</h3>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                 <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Chọn phòng</label>
                  <select 
                    value={selectedRoomId}
                    onChange={e => setSelectedRoomId(e.target.value)}
                    className="w-full rounded-lg bg-[#0f172a] border-[#334155] text-[#f8fafc] border p-2 text-sm"
                    required
                  >
                    <option value="" disabled>-- Chọn phòng --</option>
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
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Giờ dọn</label>
                  <input 
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full rounded-lg bg-[#0f172a] border-[#334155] text-[#f8fafc] border p-2 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="px-8 bg-[#10b981] hover:bg-[#059669] text-[#0f172a]">Lưu Lịch</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Hủy</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-8">
        {floors.map(floor => (
          <div key={floor.name} className="space-y-4">
            <h2 className="text-lg font-bold text-[#94a3b8] border-b border-[#334155] pb-2">{floor.name}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {floor.rooms.map(room => {
                const pendingTask = getRoomTask(room.id);
                // Compute visual status mapping
                const cleanStatus = room.cleanStatus || 'clean';
                
                return (
                  <Card key={room.id} className="border-[#334155] hover:border-[#64748b] transition-colors relative">
                    <CardContent className="p-4 flex flex-col h-full">
                       <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-2">
                           <span className="text-2xl font-bold text-[#f8fafc]">{room.number}</span>
                         </div>
                         <Badge 
                           variant={
                             cleanStatus === 'clean' ? 'success' : 
                             cleanStatus === 'dirty' ? 'danger' : 'info'
                           }
                         >
                           {cleanStatus === 'clean' ? 'Sạch' : cleanStatus === 'dirty' ? 'Bẩn' : 'Đang dọn'}
                         </Badge>
                       </div>
                       
                       <div className="flex-1 mt-2 bg-[#0f172a] p-3 rounded-lg border border-[#334155] space-y-2">
                          <div className="text-xs text-[#94a3b8] font-medium uppercase tracking-wider">Lịch dự kiến</div>
                          {pendingTask ? (
                             <div className="flex items-center gap-2 text-[#f8fafc]">
                               <Clock size={14} className="text-[#38bdf8]" />
                               <span className="text-sm">{pendingTask.scheduledTime} - {pendingTask.scheduledDate.split('-').reverse().join('/')}</span>
                             </div>
                          ) : (
                             <div className="flex items-center gap-2 text-[#64748b] italic">
                               <Calendar size={14} />
                               <span className="text-xs">Chưa có lịch dọn</span>
                             </div>
                          )}
                       </div>
                       
                       <div className="mt-4 pt-3 border-t border-[#334155]">
                          <Button 
                            variant="ghost" 
                            className="w-full text-xs hover:bg-[#38bdf8]/10 hover:text-[#38bdf8]"
                            onClick={() => {
                               setSelectedRoomId(room.id);
                               setShowForm(true);
                            }}
                          >
                            {pendingTask ? 'Đổi lịch dọn' : 'Gán lịch dọn'}
                          </Button>
                       </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
