import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Badge, Button } from './ui';
import { useAppContext } from '../lib/context';
import { Task, TaskItem } from '../lib/utils';
import { CheckSquare, Square, Plus, Trash2, CalendarClock, User, Clock, CheckCircle, Home } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

export function Tasks() {
  const { user, role, tasks, addTask, updateTask, deleteTask, usersList, rooms } = useAppContext();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [roomId, setRoomId] = useState('');
  const [type, setType] = useState<'daily'|'ad_hoc'>('ad_hoc');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [deadline, setDeadline] = useState('');
  const [items, setItems] = useState<TaskItem[]>([]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'daily' | 'ad_hoc'>('all');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    setItems([...items, { id: `ti-${Date.now()}`, title: newItemTitle, isCompleted: false }]);
    setNewItemTitle('');
  };
  
  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assignedTo) return;

    if (editingId) {
       updateTask(editingId, {
          title, type, description, assignedTo, deadline: deadline || undefined, items, roomId: roomId || undefined
       });
    } else {
       const newTask: Task = {
         id: `task-${Date.now()}`,
         title,
         type,
         roomId: roomId || undefined,
         description,
         assignedTo,
         deadline: deadline || undefined,
         status: 'pending',
         items,
         createdAt: new Date().toISOString()
       };
       addTask(newTask);
    }
    setShowForm(false);
    resetForm();
  };
  
  const handleEditTask = (task: Task) => {
     setEditingId(task.id);
     setTitle(task.title);
     setRoomId(task.roomId || '');
     setType(task.type || 'ad_hoc');
     setDescription(task.description || '');
     setAssignedTo(task.assignedTo);
     setDeadline(task.deadline || '');
     setItems(task.items || []);
     setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setRoomId('');
    setType('ad_hoc');
    setDescription('');
    setAssignedTo('');
    setDeadline('');
    setItems([]);
  };

  const safeUsersList = usersList || [];
  const safeTasks = tasks || [];
  const technicians = safeUsersList.filter(u => u.role === 'technician');

  let visibleTasks = role === 'landlord' 
       ? safeTasks
       : safeTasks.filter(t => t.assignedTo === user?.id);

  if (filterType !== 'all') {
      visibleTasks = visibleTasks.filter(t => t.type === filterType);
  }

  visibleTasks = [...visibleTasks].sort((a,b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const getStatusBadge = (status: Task['status']) => {
    const map = {
       'pending': <Badge variant="warning">CHỜ XỬ LÝ</Badge>,
       'in-progress': <Badge variant="info">ĐANG THỰC HIỆN</Badge>,
       'completed': <Badge variant="success">HOÀN THÀNH</Badge>
    };
    return map[status];
  };

  const calculateProgress = (taskParts: TaskItem[]) => {
    if (!taskParts || taskParts.length === 0) return 0;
    const completed = taskParts.filter(i => i.isCompleted).length;
    return Math.round((completed / taskParts.length) * 100);
  };
  
  const handleToggleSubtask = (taskId: string, itemId: string, currentVal: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newItems = task.items.map(i => i.id === itemId ? { ...i, isCompleted: !currentVal } : i);
    updateTask(taskId, { items: newItems });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-[#f8fafc]">Quản lý, Phân công & Checklist</h1>
           <p className="text-[#94a3b8] mt-1 text-sm">Theo dõi tiến độ công việc bảo trì & dọn dẹp</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
           {showReport ? (
              <Button variant="outline" onClick={() => setShowReport(false)}>Quay lại Danh sách</Button>
           ) : (
              <>
                 <Button variant="outline" onClick={() => setShowReport(true)} className="flex items-center gap-2 text-[#38bdf8]">
                    Báo cáo theo phòng
                 </Button>
                 <div className="flex bg-[#1e293b] rounded-lg p-1 border border-[#334155]">
                    <button onClick={() => setFilterType('all')} className={cn("px-3 py-1.5 rounded-md text-sm transition-colors", filterType === 'all' ? "bg-[#38bdf8] text-[#0f172a] font-medium" : "text-[#94a3b8] hover:text-[#f8fafc]")}>Tất cả</button>
                    <button onClick={() => setFilterType('daily')} className={cn("px-3 py-1.5 rounded-md text-sm transition-colors", filterType === 'daily' ? "bg-[#38bdf8] text-[#0f172a] font-medium" : "text-[#94a3b8] hover:text-[#f8fafc]")}>Hàng ngày</button>
                    <button onClick={() => setFilterType('ad_hoc')} className={cn("px-3 py-1.5 rounded-md text-sm transition-colors", filterType === 'ad_hoc' ? "bg-[#38bdf8] text-[#0f172a] font-medium" : "text-[#94a3b8] hover:text-[#f8fafc]")}>Đột xuất</button>
                 </div>
                 {role === 'landlord' && (
                    <Button onClick={() => { setShowForm(!showForm); if(!showForm) resetForm(); }}>
                      {showForm ? 'Hủy' : 'Giao Việc Mới'}
                    </Button>
                 )}
              </>
           )}
        </div>
      </div>

      {showReport ? (
         <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader title="Báo cáo Bảo trì theo phòng" subtitle="Thống kê các hạng mục đã / đang thực hiện tại mỗi phòng" />
            <CardContent className="p-0 overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-[#0f172a] text-[#94a3b8] text-xs uppercase tracking-wider font-bold">
                        <th className="px-6 py-4 border-b border-[#334155]">Phòng</th>
                        <th className="px-6 py-4 border-b border-[#334155]">Công việc</th>
                        <th className="px-6 py-4 border-b border-[#334155]">Trạng thái</th>
                        <th className="px-6 py-4 border-b border-[#334155]">Chi tiết Checklist</th>
                     </tr>
                  </thead>
                  <tbody>
                     {rooms.map(room => {
                        const roomTasks = safeTasks.filter(t => t.roomId === room.id);
                        if (roomTasks.length === 0) return null;
                        return (
                           <React.Fragment key={room.id}>
                              {roomTasks.map((t, idx) => (
                                 <tr key={t.id} className="border-b border-[#334155]/50 hover:bg-[#334155]/20">
                                    {idx === 0 && (
                                       <td className="px-6 py-4 text-[#f8fafc] font-bold border-r border-[#334155]/50" rowSpan={roomTasks.length}>
                                          P.{room.number}
                                       </td>
                                    )}
                                    <td className="px-6 py-4 text-[#e2e8f0]">
                                       <div className="font-medium">{t.title}</div>
                                       <div className="text-xs text-[#94a3b8] mt-1">{t.type === 'daily' ? 'Hàng ngày' : 'Đột xuất'}</div>
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(t.status)}</td>
                                    <td className="px-6 py-4">
                                       {t.items.length > 0 ? (
                                          <ul className="text-xs text-[#cbd5e1] space-y-1">
                                             {t.items.map(item => (
                                                <li key={item.id} className="flex items-start gap-1.5">
                                                   {item.isCompleted ? <CheckSquare size={12} className="text-[#10b981] mt-0.5" /> : <Square size={12} className="text-[#64748b] mt-0.5" />}
                                                   <span className={cn(item.isCompleted && "text-[#94a3b8] line-through")}>{item.title}</span>
                                                </li>
                                             ))}
                                          </ul>
                                       ) : (
                                          <span className="text-xs text-[#64748b] italic">Không có checklist chi tiết</span>
                                       )}
                                    </td>
                                 </tr>
                              ))}
                           </React.Fragment>
                        );
                     })}
                  </tbody>
               </table>
            </CardContent>
         </Card>
      ) : (
         <>
            {showForm && role === 'landlord' && (
        <Card className="bg-[#1e293b] border-2 border-[#38bdf8]">
          <CardHeader title={editingId ? "Thêm/Sửa Checklist" : "Giao Việc Mới"} subtitle="Điền thông tin và tạo các đầu mục Checklist chi tiết" />
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Tên công việc</label>
                  <input 
                     type="text" 
                     className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-[#f8fafc] focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]" 
                     placeholder="VD: Kiểm tra định kỳ cơ sở vật chất"
                     value={title} onChange={(e) => setTitle(e.target.value)} required 
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Loại công việc</label>
                  <select 
                     className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-[#f8fafc] focus:outline-none focus:border-[#38bdf8]"
                     value={type} onChange={(e) => setType(e.target.value as 'daily' | 'ad_hoc')} required
                  >
                     <option value="ad_hoc">Đột xuất (Một lần)</option>
                     <option value="daily">Hàng ngày (Lặp lại)</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Gắn với phòng (Tùy chọn)</label>
                  <select 
                     className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-[#f8fafc] focus:outline-none focus:border-[#38bdf8]"
                     value={roomId} onChange={(e) => setRoomId(e.target.value)}
                  >
                     <option value="">Không gắn với phòng nào</option>
                     {rooms.map(r => <option key={r.id} value={r.id}>Phòng {r.number}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Giao cho nhân viên</label>
                  <select 
                     className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-[#f8fafc] focus:outline-none focus:border-[#38bdf8]"
                     value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} required
                  >
                     <option value="" disabled>-- Chọn kỹ thuật viên --</option>
                     {technicians.map(t => <option key={t.id} value={t.id}>{t.name} ({t.phone})</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Hạn chót (Deadline - Tùy chọn)</label>
                  <input 
                     type="datetime-local" 
                     className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-[#f8fafc] focus:outline-none focus:border-[#38bdf8]" 
                     value={deadline} onChange={(e) => setDeadline(e.target.value)}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Mô tả thêm (Tùy chọn)</label>
                  <input 
                     type="text" 
                     className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-[#f8fafc] focus:outline-none focus:border-[#38bdf8]" 
                     placeholder="Ghi chú thêm..."
                     value={description} onChange={(e) => setDescription(e.target.value)} 
                  />
               </div>
            </div>

            <div className="bg-[#0f172a] p-4 rounded-xl border border-[#334155]">
               <h3 className="font-bold text-[#f8fafc] mb-4 text-sm flex items-center gap-2">
                 <CheckSquare size={16} className="text-[#38bdf8]" />
                 Danh sách đầu việc nhỏ (Sub-tasks / Checklist)
               </h3>
               
               <div className="space-y-2 mb-4">
                 {items.length === 0 && <p className="text-xs text-[#94a3b8] italic">Chưa có đầu việc nhỏ. Hãy thêm ít nhất 1 việc.</p>}
                 {items.map((item, idx) => (
                    <div key={item.id} className="flex items-center justify-between bg-[#1e293b] p-2 px-3 rounded-lg border border-[#334155]/50">
                       <span className="text-sm text-[#e2e8f0] flex gap-2 items-center">
                          <Square size={14} className="text-[#64748b]" /> {item.title}
                       </span>
                       <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-[#ef4444] p-1.5 hover:bg-[#ef4444]/10 rounded-md transition-colors"><Trash2 size={14} /></button>
                    </div>
                 ))}
               </div>
               
               <div className="flex gap-2">
                 <input 
                    type="text" 
                    className="flex-1 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-[#f8fafc] focus:outline-none focus:border-[#38bdf8]" 
                    placeholder="Nhập tên đầu việc nhỏ..."
                    value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)}
                    onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddItem(e);
                       }
                    }}
                 />
                 <Button type="button" variant="ghost" className="bg-[#38bdf8]/10 text-[#38bdf8] hover:bg-[#38bdf8]/20" onClick={handleAddItem}>
                   <Plus size={16} /> Thêm
                 </Button>
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
               <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Hủy</Button>
               <Button type="button" className="bg-[#10b981] hover:bg-[#059669] text-[#0f172a]" onClick={handleCreateTask}>Lưu Giao Việc</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {visibleTasks.map(task => {
            const assignee = safeUsersList.find(u => u.id === task.assignedTo);
            const progress = calculateProgress(task.items);
            return (
               <Card key={task.id} className="flex flex-col border-[#334155] bg-[#1e293b] transition-all hover:bg-[#334155]/20">
                  <div className="p-5 border-b border-[#334155] bg-[#0f172a]/30">
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col gap-1 pr-4">
                           <h3 className="font-bold text-[#f8fafc] text-lg">{task.title}</h3>
                           <div>
                              <Badge variant="ghost" className={cn("text-[10px] font-normal tracking-wide", task.type === 'daily' ? "border-[#10b981]/30 text-[#10b981]" : "border-[#f59e0b]/30 text-[#f59e0b]")}>
                                 {task.type === 'daily' ? 'HẰNG NGÀY' : 'ĐỘT XUẤT'}
                              </Badge>
                           </div>
                        </div>
                        {getStatusBadge(task.status)}
                     </div>
                     {task.description && <p className="text-sm text-[#94a3b8] mb-4">{task.description}</p>}
                     
                     <div className="flex flex-wrap gap-4 text-xs font-medium text-[#94a3b8] mt-2">
                        {task.roomId && (() => {
                           const room = rooms.find(r => r.id === task.roomId);
                           return room ? (
                              <div className="flex items-center gap-1.5 text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded">
                                 <Home size={14} /> P.{room.number}
                              </div>
                           ) : null;
                        })()}
                        <div className="flex items-center gap-1.5"><CalendarClock size={14} className="text-[#f59e0b]"/> Hạn: {task.deadline && task.deadline.includes('T') ? `${formatDate(task.deadline.split('T')[0])} ${task.deadline.split('T')[1] || ''}` : 'Linh hoạt'}</div>
                        <div className="flex items-center gap-1.5"><User size={14} className="text-[#38bdf8]"/> {assignee?.name || 'Vô danh'}</div>
                     </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                     <div className="mb-4">
                        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                           <span className="text-[#e2e8f0]">Tiến độ ({(task.items || []).filter(i => i.isCompleted).length}/{(task.items || []).length})</span>
                           <span className={cn(
                              progress === 100 ? "text-[#22c55e]" : "text-[#38bdf8]"
                           )}>{progress}%</span>
                        </div>
                        <div className="h-2 bg-[#0f172a] rounded-full overflow-hidden border border-[#334155]/50">
                           <div 
                              className={cn(
                                 "h-full transition-all duration-500",
                                 progress === 100 ? "bg-[#22c55e]" : "bg-gradient-to-r from-[#0284c7] to-[#38bdf8]"
                               )} 
                              style={{ width: `${progress}%` }}
                           ></div>
                        </div>
                     </div>

                     <div className="space-y-2 mt-auto">
                        {(task.items || []).map(item => (
                           <label key={item.id} className={cn(
                              "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                              item.isCompleted ? "bg-[#22c55e]/5 border-[#22c55e]/20 text-[#94a3b8]" : "bg-[#0f172a] border-[#334155] hover:border-[#38bdf8]/50 text-[#f8fafc]"
                           )}>
                              <input 
                                 type="checkbox"
                                 checked={item.isCompleted}
                                 onChange={() => handleToggleSubtask(task.id, item.id, item.isCompleted)}
                                 className="mt-0.5 rounded border-[#334155] bg-transparent text-[#22c55e] focus:ring-[#22c55e]"
                                 disabled={role !== 'technician' && role !== 'landlord'}
                              />
                              <span className={cn("text-sm", item.isCompleted && "line-through italic")}>{item.title}</span>
                           </label>
                        ))}
                     </div>
                  </div>
                  {role === 'landlord' && (
                     <div className="p-3 bg-[#0f172a] border-t border-[#334155] rounded-b-xl flex justify-end gap-2">
                        <Button variant="ghost" className="text-[#38bdf8] hover:bg-[#38bdf8]/10 h-8 px-3 text-xs" onClick={() => handleEditTask(task)}>Sửa</Button>
                        <Button variant="ghost" className="text-[#ef4444] hover:bg-[#ef4444]/10 h-8 px-3 text-xs" onClick={() => deleteTask(task.id)}>Xóa Task</Button>
                     </div>
                  )}
               </Card>
            );
         })}
         {visibleTasks.length === 0 && (
            <div className="col-span-2 text-center p-12 text-[#94a3b8] bg-[#1e293b]/50 rounded-xl border border-[#334155]/50 border-dashed">
               <CheckCircle size={48} className="mx-auto mb-4 text-[#334155]" />
               <p>Không có công việc nào cần xử lý lúc này.</p>
            </div>
         )}
      </div>
      </>
      )}
    </div>
  );
}
