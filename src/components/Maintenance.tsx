import React, { useState } from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardHeader, CardContent, Badge, Button } from './ui';
import { Wrench, Sparkles, CheckCircle } from 'lucide-react';

export function Maintenance() {
  const { role, issues, addIssue, updateIssue, rooms } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [roomId, setRoomId] = useState(rooms[0].id);
  const [maintenanceDate, setMaintenanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'repair' | 'cleaning'>('repair');

  const displayIssues = role === 'tenant' 
    ? issues.filter(i => i.roomId === 'r1') // Mock current tenant room
    : issues;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    addIssue({
      id: `i${Date.now()}`,
      roomId: role === 'tenant' ? 'r1' : roomId,
      title,
      description: desc,
      status: 'open',
      createdAt: maintenanceDate,
      type
    });
    
    setShowForm(false);
    setTitle('');
    setDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#f8fafc]">
          {role === 'landlord' ? 'Lịch Bảo trì & Dọn dẹp' : 'Yêu cầu Hỗ trợ'}
        </h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Hủy' : role === 'landlord' ? '+ Lên lịch bảo trì' : '+ Đặt lịch / Báo cáo'}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-[#38bdf8]/5 border-[#38bdf8]/20">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
              <h3 className="font-semibold text-lg text-[#f8fafc]">
                {role === 'landlord' ? 'Lên lịch bảo trì phòng' : 'Gửi yêu cầu mới'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {role === 'landlord' && (
                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-1">Chọn phòng</label>
                    <select 
                      value={roomId}
                      onChange={e => setRoomId(e.target.value)}
                      className="w-full rounded-md bg-[#0f172a] border-[#334155] text-[#f8fafc] shadow-sm focus:border-[#38bdf8] focus:ring-[#38bdf8] border p-2 text-sm"
                    >
                      {rooms.map(r => <option key={r.id} value={r.id}>Phòng {r.number}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Ngày thực hiện</label>
                  <input 
                    type="date" 
                    value={maintenanceDate}
                    onChange={e => setMaintenanceDate(e.target.value)}
                    className="w-full rounded-md bg-[#0f172a] border-[#334155] text-[#f8fafc] shadow-sm focus:border-[#38bdf8] focus:ring-[#38bdf8] border p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Loại yêu cầu</label>
                  <select 
                    value={type}
                    onChange={e => setType(e.target.value as 'repair' | 'cleaning')}
                    className="w-full rounded-md bg-[#0f172a] border-[#334155] text-[#f8fafc] shadow-sm focus:border-[#38bdf8] focus:ring-[#38bdf8] border p-2 text-sm"
                  >
                    <option value="repair">Sửa chữa / Bảo trì</option>
                    <option value="cleaning">Dọn dẹp vệ sinh</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1">Vấn đề / Tiêu đề</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full rounded-md bg-[#0f172a] border-[#334155] text-[#f8fafc] shadow-sm focus:border-[#38bdf8] focus:ring-[#38bdf8] border p-2 text-sm"
                  placeholder="Ví dụ: Kiểm tra điều hòa định kỳ..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1">Ghi chú chi tiết</label>
                <textarea 
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full rounded-md bg-[#0f172a] border-[#334155] text-[#f8fafc] shadow-sm focus:border-[#38bdf8] focus:ring-[#38bdf8] border p-2 text-sm"
                  rows={3}
                  placeholder="Mô tả cụ thể nội dung bảo trì..."
                ></textarea>
              </div>
              <Button type="submit">Xác nhận lên lịch</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {displayIssues.length === 0 ? (
          <div className="text-center py-12 bg-[#1e293b]/50 rounded-xl border border-dashed border-[#334155]">
            <CheckCircle className="mx-auto h-12 w-12 text-[#334155] mb-3" />
            <p className="text-[#94a3b8] font-medium">Không có sự cố nào.</p>
          </div>
        ) : (
          displayIssues.map(issue => (
            <Card key={issue.id} className="hover:border-[#38bdf8]/50 transition-colors">
              <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex gap-4 items-start">
                  <div className={`p-3 rounded-xl shrink-0 ${issue.type === 'cleaning' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>
                    {issue.type === 'cleaning' ? <Sparkles size={24} /> : <Wrench size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-[#f8fafc]">{issue.title}</h3>
                      <Badge variant={issue.status === 'resolved' ? 'success' : issue.status === 'in-progress' ? 'info' : 'warning'}>
                        {issue.status === 'resolved' ? 'Đã xong' : issue.status === 'in-progress' ? 'Đang sửa' : 'Mới'}
                      </Badge>
                    </div>
                    <p className="text-[#94a3b8] text-sm mb-2">{issue.description}</p>
                    <div className="flex gap-3 text-xs text-[#64748b] font-medium">
                      <span>Ngày tạo: {issue.createdAt}</span>
                      {role === 'landlord' && <span>• Phòng: {rooms.find(r => r.id === issue.roomId)?.number}</span>}
                    </div>
                  </div>
                </div>

                {role === 'landlord' && issue.status !== 'resolved' && (
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
