import React, { useState } from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardHeader, CardContent, Badge, Button } from './ui';
import { Wrench, Sparkles, CheckCircle } from 'lucide-react';

export function Maintenance() {
  const { role, issues, addIssue, updateIssue, rooms } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [roomId, setRoomId] = useState(rooms[0]?.id || '');
  const [maintenanceDate, setMaintenanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'repair' | 'cleaning'>('repair');

  const displayIssues = role === 'tenant' 
    ? issues.filter(i => i.roomId === 'r1' && i.type === 'repair') // Mock current tenant room
    : issues.filter(i => i.type === 'repair');

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
      type: 'repair'
    });
    
    setShowForm(false);
    setTitle('');
    setDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#f8fafc]">
          {role === 'landlord' ? 'Lệnh Yêu cầu Bảo trì' : 'Báo cáo sự cố bảo trì'}
        </h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Hủy' : role === 'landlord' ? '+ Tạo lệnh bảo trì' : '+ Báo cáo sự cố'}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-[#ef4444]/5 border-[#ef4444]/20 border-dashed">
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
                      className="w-full rounded-md bg-[#0f172a] border-[#334155] text-[#f8fafc] shadow-sm focus:border-[#ef4444] focus:ring-[#ef4444] border p-2 text-sm"
                    >
                      {rooms.map(r => <option key={r.id} value={r.id}>Phòng {r.number}</option>)}
                      <option value="elevator">Thang máy</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Ngày thực hiện</label>
                  <input 
                    type="date" 
                    value={maintenanceDate}
                    onChange={e => setMaintenanceDate(e.target.value)}
                    className="w-full rounded-md bg-[#0f172a] border-[#334155] text-[#f8fafc] shadow-sm focus:border-[#ef4444] focus:ring-[#ef4444] border p-2 text-sm"
                  />
                </div>
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
                    <div className="flex gap-3 text-xs text-[#64748b] font-medium">
                      <span>Ngày: {issue.createdAt}</span>
                      {role === 'landlord' && (
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
