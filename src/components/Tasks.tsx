import React, { useState } from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardHeader, CardContent, Button, Badge } from './ui';
import { Plus, CheckCircle, Circle, Trash2, Calendar, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { TodoTask } from '../lib/utils';

export function Tasks() {
  const { tasks, addTask, updateTask, deleteTask } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    const newTask: TodoTask = {
      id: `task-${Date.now()}`,
      title,
      description,
      status: 'todo',
      createdAt: new Date().toISOString(),
      dueDate: dueDate || undefined
    };

    addTask(newTask);
    setTitle('');
    setDescription('');
    setDueDate('');
    setShowForm(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'todo': return <Badge variant="warning">Chưa làm</Badge>;
      case 'in-progress': return <Badge variant="info">Đang làm</Badge>;
      case 'done': return <Badge variant="success">Hoàn thành</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#1e293b] p-6 rounded-xl border border-[#334155]">
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc] flex items-center gap-2">
            <FileText className="text-[#38bdf8]" /> Ghi chú & Công việc
          </h1>
          <p className="text-[#94a3b8] text-sm mt-1">Theo dõi danh sách công việc và ghi chú cá nhân.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          {showForm ? 'Hủy' : <><Plus size={18} /> Thêm ghi chú</>}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-[#1e293b]/50 border-[#334155] animate-in fade-in zoom-in duration-200">
          <CardContent className="p-6">
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-1">Tiêu đề công việc</label>
                    <input 
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full rounded-lg bg-[#0f172a] border-[#334155] text-[#f8fafc] border p-2.5 text-sm focus:ring-1 focus:ring-[#38bdf8]"
                      placeholder="VD: Kiểm tra đồng hồ nước phòng 201..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-1">Ngày hạn (Tùy chọn)</label>
                    <input 
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="w-full rounded-lg bg-[#0f172a] border-[#334155] text-[#f8fafc] border p-2.5 text-sm focus:ring-1 focus:ring-[#38bdf8]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Ghi chú chi tiết</label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg bg-[#0f172a] border-[#334155] text-[#f8fafc] border p-2.5 text-sm focus:ring-1 focus:ring-[#38bdf8] resize-none"
                    placeholder="Mô tả chi tiết công việc hoặc thông tin cần ghi nhớ..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Hủy bỏ</Button>
                <Button type="submit" className="bg-[#38bdf8] hover:bg-[#0284c7] text-[#0f172a]">Lưu & Thêm</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {tasks.length === 0 && !showForm ? (
        <div className="bg-[#1e293b] p-12 text-center rounded-xl border border-[#334155]">
          <FileText className="mx-auto text-[#94a3b8] mb-4 opacity-50" size={48} />
          <p className="text-[#f8fafc] font-medium text-lg mb-2">Chưa có ghi chú nào</p>
          <p className="text-[#94a3b8] text-sm mb-6">Bạn có thể tạo các ghi chú hoặc việc cần làm tại đây.</p>
          <Button onClick={() => setShowForm(true)}>Tạo ghi chú đầu tiên</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['todo', 'in-progress', 'done'].map(status => {
            const list = tasks.filter(t => t.status === status);
            const titles: any = { 'todo': 'Cần Làm', 'in-progress': 'Đang Thực Hiện', 'done': 'Đã Hoàn Thành' };
            const colors: any = { 'todo': 'border-l-[#f59e0b]', 'in-progress': 'border-l-[#38bdf8]', 'done': 'border-l-[#10b981]' };
            
            return (
              <div key={status} className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#334155] pb-2">
                  <h3 className="font-bold text-[#f8fafc]">{titles[status]}</h3>
                  <span className="bg-[#0f172a] text-[#94a3b8] text-xs px-2 py-0.5 rounded-full font-medium">{list.length}</span>
                </div>
                
                <div className="space-y-3">
                  {list.map(task => (
                    <Card key={task.id} className={cn("hover:bg-[#334155]/20 transition-all border-l-4", colors[status], task.status === 'done' && "opacity-75")}>
                      <CardContent className="p-4 relative group">
                        <div className="flex justify-between items-start pr-6">
                          <h4 className={cn("font-semibold text-[#f8fafc]", task.status === 'done' && "line-through text-[#94a3b8]")}>{task.title}</h4>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-[#94a3b8] mt-2 line-clamp-3">{task.description}</p>
                        )}
                        
                        {(task.dueDate || task.status === 'done') && (
                          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#334155]/50 text-xs text-[#64748b]">
                            {task.dueDate && (
                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span>Hạn: {task.dueDate.split('-').reverse().join('/')}</span>
                              </div>
                            )}
                            {task.status === 'done' && (
                              <div className="flex items-center gap-1 text-[#10b981]">
                                <CheckCircle size={12} />
                                <span>Đã xong</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Interactive Buttons */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {task.status === 'todo' && (
                            <button onClick={() => updateTask(task.id, { status: 'in-progress' })} className="text-[#38bdf8] hover:bg-[#38bdf8]/20 p-1.5 rounded-md" title="Mới bắt đầu làm">
                              <Circle size={16} />
                            </button>
                          )}
                          {(task.status === 'todo' || task.status === 'in-progress') && (
                            <button onClick={() => updateTask(task.id, { status: 'done' })} className="text-[#10b981] hover:bg-[#10b981]/20 p-1.5 rounded-md" title="Đánh dấu hoàn thành">
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button onClick={() => deleteTask(task.id)} className="text-[#ef4444] hover:bg-[#ef4444]/20 p-1.5 rounded-md" title="Xóa ghi chú">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
