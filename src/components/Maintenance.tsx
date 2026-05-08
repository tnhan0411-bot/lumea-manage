import React, { useState } from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardHeader, CardContent, Badge, Button } from './ui';
import { Wrench, Sparkles, CheckCircle } from 'lucide-react';

export function Maintenance() {
  const { role, issues, addIssue, updateIssue, editIssue, deleteIssue, rooms } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editIssueId, setEditIssueId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [roomId, setRoomId] = useState(rooms[0]?.id || '');
  const [maintenanceDate, setMaintenanceDate] = useState(new Date().toISOString().split('T')[0]); // Used as createdAt or report date
  const [dueDate, setDueDate] = useState('');
  const [type, setType] = useState<'repair' | 'cleaning'>('repair');
  
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all');

  const allRepairIssues = issues.filter(i => i.type === 'repair');
  
  let displayIssues = role === 'tenant' 
    ? allRepairIssues.filter(i => i.roomId === 'r1') // Mock current tenant room
    : allRepairIssues;

  if (filterStatus !== 'all') {
    displayIssues = displayIssues.filter(i => i.status === filterStatus);
  }

  const resolvedCount = allRepairIssues.filter(i => i.status === 'resolved').length;
  const pendingCount = allRepairIssues.filter(i => i.status !== 'resolved').length;
  const completionRate = allRepairIssues.length > 0 ? Math.round((resolvedCount / allRepairIssues.length) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    if (editIssueId) {
      editIssue(editIssueId, {
        roomId: role === 'tenant' ? 'r1' : roomId,
        title,
        description: desc,
        createdAt: maintenanceDate,
        dueDate: dueDate || undefined,
      });
      setEditIssueId(null);
    } else {
      addIssue({
        id: `i${Date.now()}`,
        roomId: role === 'tenant' ? 'r1' : roomId,
        title,
        description: desc,
        status: 'open',
        createdAt: maintenanceDate,
        dueDate: dueDate || undefined,
        type: 'repair'
      });
    }
    
    setShowForm(false);
    setTitle('');
    setDesc('');
    setDueDate('');
  };

  const handleEditClick = (issue: any) => {
    setEditIssueId(issue.id);
    setTitle(issue.title);
    setDesc(issue.description);
    setRoomId(issue.roomId);
    setMaintenanceDate(issue.createdAt || new Date().toISOString().split('T')[0]);
    setDueDate(issue.dueDate || '');
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lệnh bảo trì này?')) {
      deleteIssue(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#f8fafc]">
          {role === 'landlord' ? 'Lệnh Yêu cầu Bảo trì' : 'Báo cáo sự cố bảo trì'}
        </h1>
        <Button onClick={() => {
          if (showForm) {
            setShowForm(false);
            setEditIssueId(null);
            setTitle('');
            setDesc('');
          } else {
            setShowForm(true);
          }
        }}>
          {showForm ? 'Hủy' : role === 'landlord' ? '+ Tạo lệnh bảo trì' : '+ Báo cáo sự cố'}
        </Button>
      </div>

      {(role === 'landlord' || role === 'technician') && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#1e293b]/50 border-[#334155]/50 flex flex-col justify-between">
            <CardContent className="p-4 flex flex-col h-full justify-between">
              <div>
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">Tỉ lệ hoàn thành</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#f8fafc]">
                    {completionRate}%
                  </span>
                  <span className="text-xs text-[#94a3b8]">hiệu suất</span>
                </div>
              </div>
              <div className="mt-4 w-full bg-[#334155] rounded-full h-1.5">
                <div 
                  className="bg-[#38bdf8] h-1.5 rounded-full" 
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1e293b]/50 border-[#334155]/50">
            <CardContent className="p-4">
              <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">Đã hoàn thành</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#10b981]">{resolvedCount}</span>
                <span className="text-xs text-[#94a3b8]">lệnh</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#1e293b]/50 border-[#334155]/50">
            <CardContent className="p-4">
              <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">Đang xử lý</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#38bdf8]">{allRepairIssues.filter(i => i.status === 'in-progress').length}</span>
                <span className="text-xs text-[#94a3b8]">lệnh</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1e293b]/50 border-[#334155]/50">
            <CardContent className="p-4">
              <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">Chưa xử lý</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#fbbf24]">{allRepairIssues.filter(i => i.status === 'open').length}</span>
                <span className="text-xs text-[#94a3b8]">lệnh</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showForm && (
        <Card className="bg-[#ef4444]/5 border-[#ef4444]/20 border-dashed">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
              <h3 className="font-semibold text-lg text-[#f8fafc]">
                {editIssueId ? 'Chỉnh sửa lệnh bảo trì' : role === 'landlord' ? 'Lên lịch bảo trì phòng' : 'Gửi yêu cầu mới'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {role !== 'tenant' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#94a3b8] mb-1">Chọn phòng</label>
                    <select 
                      value={roomId}
                      onChange={e => setRoomId(e.target.value)}
                      className="w-full rounded-md bg-[#0f172a] border-[#334155] text-[#f8fafc] shadow-sm focus:border-[#ef4444] focus:ring-[#ef4444] border p-2 text-sm"
                    >
                      {rooms.map(r => <option key={r.id} value={r.id}>Phòng {r.number}</option>)}
                      <option value="elevator">Thang máy</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Ngày xử lý/Báo cáo</label>
                  <input 
                    type="date" 
                    value={maintenanceDate}
                    onChange={e => setMaintenanceDate(e.target.value)}
                    className="w-full rounded-md bg-[#0f172a] border-[#334155] text-[#f8fafc] shadow-sm focus:border-[#ef4444] focus:ring-[#ef4444] border p-2 text-sm"
                  />
                </div>
                {role === 'landlord' && (
                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-1">Hạn hoàn thành</label>
                    <input 
                      type="date" 
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="w-full rounded-md bg-[#0f172a] border-[#334155] text-[#f8fafc] shadow-sm focus:border-[#ef4444] focus:ring-[#ef4444] border p-2 text-sm"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1">Thiết bị / Vấn đề</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full rounded-md bg-[#0f172a] border-[#334155] text-[#f8fafc] shadow-sm focus:border-[#ef4444] focus:ring-[#ef4444] border p-2 text-sm"
                  placeholder="Ví dụ: Thay bóng đèn, Sửa vòi rò rỉ..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1">Mô tả tình trạng</label>
                <textarea 
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full rounded-md bg-[#0f172a] border-[#334155] text-[#f8fafc] shadow-sm focus:border-[#ef4444] focus:ring-[#ef4444] border p-2 text-sm"
                  rows={3}
                  placeholder="Mô tả cụ thể nội dung cần bảo trì..."
                ></textarea>
              </div>
              <Button type="submit" variant="danger">Xác nhận tạo lệnh</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {(role === 'landlord' || role === 'technician') && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant={filterStatus === 'all' ? 'primary' : 'outline'} size="sm" onClick={() => setFilterStatus('all')}>
            Tất cả
          </Button>
          <Button variant={filterStatus === 'open' ? 'warning' : 'outline'} size="sm" onClick={() => setFilterStatus('open')}>
            Chưa xử lý
          </Button>
          <Button variant={filterStatus === 'in-progress' ? 'info' : 'outline'} size="sm" onClick={() => setFilterStatus('in-progress')}>
            Đang sửa
          </Button>
          <Button variant={filterStatus === 'resolved' ? 'success' : 'outline'} size="sm" onClick={() => setFilterStatus('resolved')}>
            Đã hoàn thành
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {displayIssues.length === 0 ? (
          <div className="text-center py-12 bg-[#1e293b]/50 rounded-xl border border-dashed border-[#334155]">
            <CheckCircle className="mx-auto h-12 w-12 text-[#334155] mb-3" />
            <p className="text-[#94a3b8] font-medium">Không có sự cố bảo trì nào.</p>
          </div>
        ) : (
          displayIssues.map(issue => (
            <Card key={issue.id} className="hover:border-[#ef4444]/50 transition-colors border-l-4 border-l-[#ef4444]">
              <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex gap-4 items-start">
                  <div className={`p-3 rounded-xl shrink-0 bg-[#ef4444]/10 text-[#ef4444]`}>
                    <Wrench size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-[#f8fafc]">{issue.title}</h3>
                      <Badge variant={issue.status === 'resolved' ? 'success' : issue.status === 'in-progress' ? 'info' : 'warning'}>
                        {issue.status === 'resolved' ? 'Đã xong' : issue.status === 'in-progress' ? 'Đang sửa' : 'Mới'}
                      </Badge>
                    </div>
                    <p className="text-[#94a3b8] text-sm mb-2">{issue.description}</p>
                    <div className="flex gap-3 text-xs text-[#64748b] font-medium items-center">
                      <span>Báo cáo: {issue.createdAt}</span>
                      {issue.dueDate && (
                        <span className="text-[#ef4444]">Hạn chót: {issue.dueDate}</span>
                      )}
                      {role !== 'tenant' && (
                        <Badge variant="info" className="text-[9px] px-1 py-0 h-4 uppercase">
                          {issue.roomId === 'elevator' ? 'Thang máy' : issue.roomId === 'other' ? 'Khác' : `Phòng ${rooms.find(r => r.id === issue.roomId)?.number || ''}`}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {role === 'technician' && issue.status !== 'resolved' && (
                  <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 justify-end">
                    {issue.status === 'open' && (
                      <Button variant="outline" size="sm" onClick={() => updateIssue(issue.id, 'in-progress')}>
                        Tiếp nhận
                      </Button>
                    )}
                    <Button variant="primary" size="sm" onClick={() => updateIssue(issue.id, 'resolved')}>
                      Hoàn thành
                    </Button>
                  </div>
                )}
                
                {role === 'landlord' && (
                  <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(issue)}>
                      Chỉnh sửa
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteClick(issue.id)}>
                      Xóa lệnh
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
