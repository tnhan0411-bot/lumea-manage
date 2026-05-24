import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Button, Badge } from './ui';
import { Plus, CheckCircle, Circle, Trash2, Calendar, FileText, Loader2, Google } from 'lucide-react';
import { cn } from '../lib/utils';
import { initAuth, googleSignIn, getAccessToken, logout } from '../lib/auth';

export function Tasks() {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [googleTasks, setGoogleTasks] = useState<any[]>([]);
  
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setNeedsAuth(false);
        fetchTasks(token);
      },
      () => {
        setNeedsAuth(true);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setNeedsAuth(false);
        fetchTasks(result.accessToken);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchTasks = async (token: string) => {
    setIsLoading(true);
    try {
      // Get all tasks from default list
      const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?showCompleted=true&showHidden=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setGoogleTasks(data.items || []);
    } catch (err) {
      console.error('Error fetching tasks', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    const token = await getAccessToken();
    if (!token) return;

    try {
      const gTask = {
        title,
        notes: description,
        due: dueDate ? new Date(dueDate).toISOString() : undefined,
      };

      const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(gTask)
      });
      
      const createdItem = await res.json();
      setGoogleTasks([createdItem, ...googleTasks]);
      
      setTitle('');
      setDescription('');
      setDueDate('');
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const completeTask = async (taskId: string, isCompleted: boolean) => {
    const token = await getAccessToken();
    if (!token) return;

    try {
      const status = isCompleted ? 'completed' : 'needsAction';
      // Optimistic update
      setGoogleTasks(googleTasks.map(t => t.id === taskId ? { ...t, status } : t));
      
      await fetch(`https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id: taskId, 
          status 
        })
      });
      // Optionally refetch
    } catch (err) {
      console.error(err);
      fetchTasks(token);
    }
  };

  const deleteTask = async (taskId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this task? This action cannot be undone.");
    if (!confirmed) return;

    const token = await getAccessToken();
    if (!token) return;

    try {
      setGoogleTasks(googleTasks.filter(t => t.id !== taskId));
      await fetch(`https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
      fetchTasks(token);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-[#38bdf8]" size={32} />
      </div>
    );
  }

  if (needsAuth) {
    return (
      <div className="flex flex-col h-64 items-center justify-center space-y-6 text-center">
        <div>
          <h2 className="text-2xl font-bold text-[#f8fafc]">Google Tasks Integration</h2>
          <p className="text-[#94a3b8] mt-2 max-w-sm">Sign in with your Google account to manage your tasks safely and securely.</p>
        </div>
        <button onClick={handleLogin} disabled={isLoggingIn} className="gsi-material-button group inline-flex items-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium px-4 py-2 rounded shadow transition-colors">
          <svg style={{width:'20px', height:'20px'}} version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
          {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    );
  }

  const todoTasks = googleTasks.filter(t => t.status === 'needsAction');
  const doneTasks = googleTasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#1e293b] p-6 rounded-xl border border-[#334155]">
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc] flex items-center gap-2">
            <FileText className="text-[#38bdf8]" /> Google Tasks
          </h1>
          <p className="text-[#94a3b8] text-sm mt-1">Đồng bộ công việc & ghi chú của bạn trực tiếp từ Google.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={logout} className="text-[#94a3b8] hover:text-[#f8fafc]">
            Đăng xuất
          </Button>
          <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
            {showForm ? 'Hủy' : <><Plus size={18} /> Thêm ghi chú</>}
          </Button>
        </div>
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

      {googleTasks.length === 0 && !showForm ? (
        <div className="bg-[#1e293b] p-12 text-center rounded-xl border border-[#334155]">
          <FileText className="mx-auto text-[#94a3b8] mb-4 opacity-50" size={48} />
          <p className="text-[#f8fafc] font-medium text-lg mb-2">Chưa có ghi chú nào</p>
          <p className="text-[#94a3b8] text-sm mb-6">Bạn có thể tạo các ghi chú hoặc việc cần làm tại đây, nó sẽ được lưu vào tài khoản Google của bạn.</p>
          <Button onClick={() => setShowForm(true)}>Tạo ghi chú đầu tiên</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#334155] pb-2">
              <h3 className="font-bold text-[#f8fafc]">Cần Làm</h3>
              <span className="bg-[#0f172a] text-[#94a3b8] text-xs px-2 py-0.5 rounded-full font-medium">{todoTasks.length}</span>
            </div>
            <div className="space-y-3">
              {todoTasks.map(task => (
                <Card key={task.id} className="hover:bg-[#334155]/20 transition-all border-l-4 border-l-[#f59e0b]">
                  <CardContent className="p-4 relative group">
                    <div className="flex justify-between items-start pr-6">
                      <h4 className="font-semibold text-[#f8fafc]">{task.title}</h4>
                    </div>
                    {task.notes && (
                      <p className="text-sm text-[#94a3b8] mt-2 whitespace-pre-wrap">{task.notes}</p>
                    )}
                    {task.due && (
                      <div className="flex items-center gap-1 text-xs text-[#64748b] mt-4 pt-3 border-t border-[#334155]/50">
                        <Calendar size={12} />
                        <span>Hạn: {new Date(task.due).toLocaleDateString('vi-VN')}</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => completeTask(task.id, true)} className="text-[#10b981] hover:bg-[#10b981]/20 p-1.5 rounded-md" title="Đánh dấu hoàn thành">
                        <CheckCircle size={16} />
                      </button>
                      <button onClick={() => deleteTask(task.id)} className="text-[#ef4444] hover:bg-[#ef4444]/20 p-1.5 rounded-md" title="Xóa ghi chú">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#334155] pb-2">
              <h3 className="font-bold text-[#f8fafc]">Đã Hoàn Thành</h3>
              <span className="bg-[#0f172a] text-[#94a3b8] text-xs px-2 py-0.5 rounded-full font-medium">{doneTasks.length}</span>
            </div>
            <div className="space-y-3">
              {doneTasks.map(task => (
                <Card key={task.id} className="hover:bg-[#334155]/20 transition-all border-l-4 border-l-[#10b981] opacity-75">
                  <CardContent className="p-4 relative group">
                    <div className="flex justify-between items-start pr-6">
                      <h4 className="font-semibold text-[#94a3b8] line-through">{task.title}</h4>
                    </div>
                    {task.notes && (
                      <p className="text-sm text-[#94a3b8] mt-2 whitespace-pre-wrap">{task.notes}</p>
                    )}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => completeTask(task.id, false)} className="text-[#f59e0b] hover:bg-[#f59e0b]/20 p-1.5 rounded-md" title="Hoàn tác">
                        <Circle size={16} />
                      </button>
                      <button onClick={() => deleteTask(task.id)} className="text-[#ef4444] hover:bg-[#ef4444]/20 p-1.5 rounded-md" title="Xóa ghi chú">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
