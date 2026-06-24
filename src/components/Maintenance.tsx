import React, { useState, useEffect } from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardHeader, CardContent, Badge, Button } from './ui';
import { Wrench, Sparkles, CheckCircle, FileText, Plus, HelpCircle, Edit, Trash2 } from 'lucide-react';

export function Maintenance() {
  const { role, issues, addIssue, updateIssue, editIssue, deleteIssue, rooms } = useAppContext();
  const [activeSubTab, setActiveSubTab] = useState<'request' | 'report'>('request');
  
  // Tab 1: Requests state
  const [showForm, setShowForm] = useState(false);
  const [editIssueId, setEditIssueId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [roomId, setRoomId] = useState(rooms[0]?.id || '');
  const [maintenanceDate, setMaintenanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all');

  // Tab 2: Maintenance Reports state (YÊU CẦU 1)
  const [reports, setReports] = useState<any[]>([]);
  const [reportRoom, setReportRoom] = useState('101');
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  // Load completed maintenance reports
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoadingReports(true);
    try {
      const res = await fetch('/api/maintenance-reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data || []);
      }
    } catch (err) {
      console.error("Error loading maintenance reports:", err);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !reportDesc.trim()) return;
    setIsSubmittingReport(true);
    try {
      const res = await fetch('/api/maintenance-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: reportRoom,
          title: reportTitle,
          description: reportDesc,
          createdAt: new Date().toISOString()
        })
      });
      if (res.ok) {
        const newRep = await res.json();
        setReports(prev => [newRep, ...prev]);
        setShowReportForm(false);
        setReportTitle('');
        setReportDesc('');
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Gặp sự cố khi gửi báo cáo bảo trì.");
      }
    } catch (err: any) {
      alert("Lỗi kết nối máy chủ: " + err.message);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const allRepairIssues = issues.filter(i => i.type === 'repair');
  
  let displayIssues = role === 'tenant' 
    ? allRepairIssues.filter(i => i.roomId === 'r1') 
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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#334155]/30 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc]">
            {role === 'landlord' ? 'Quản lý Bảo trì & Sửa lặp' : 'Báo cáo sự cố bảo trì'}
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">Lập kế hoạch, theo dõi tiến độ sửa chữa thiết bị căn hộ và tổng hợp báo cáo kỹ thuật</p>
        </div>

        {/* Tab Selection Switches */}
        <div className="flex bg-[#1e293b] p-1 rounded-xl border border-[#334155]/60">
          <button
            onClick={() => setActiveSubTab('request')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
              activeSubTab === 'request'
                ? 'bg-[#ef4444] text-white shadow-md shadow-[#ef4444]/20'
                : 'text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
          >
            <Wrench size={14} /> Yêu cầu & Lệnh sửa
          </button>
          <button
            onClick={() => setActiveSubTab('report')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
              activeSubTab === 'report'
                ? 'bg-[#ef4444] text-white shadow-md shadow-[#ef4444]/20'
                : 'text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
          >
            <FileText size={14} /> Báo cáo Bảo trì
          </button>
        </div>
      </div>

      {/* RENDER REQUEST TAB */}
      {activeSubTab === 'request' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#f8fafc]">Lịch trình & Lệnh công việc</h2>
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
      )}

      {/* RENDER REPORT TAB (YÊU CẦU 1) */}
      {activeSubTab === 'report' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#f8fafc]">Lịch sử Báo báo Bảo trì kỹ thuật</h2>
              <p className="text-xs text-[#94a3b8]">Biên bản chi tiết thiết bị hỏng hóc thực tế và thực trạng sau sửa chữa</p>
            </div>
            {role !== 'tenant' && (
              <Button onClick={() => setShowReportForm(!showReportForm)} className="gap-2">
                <Plus size={16} /> {showReportForm ? 'Thư mục' : 'Tạo Báo cáo Bảo trì'}
              </Button>
            )}
          </div>

          {showReportForm && (
            <Card className="bg-[#10b981]/5 border-[#10b981]/20 border-dashed max-w-xl">
              <CardContent className="p-6">
                <form onSubmit={handleCreateReport} className="space-y-4">
                  <h3 className="font-semibold text-base text-[#f8fafc]">Biên bản báo cáo kỹ thuật mới</h3>
                  
                  <div>
                    <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">
                      Số phòng bảo trì <span className="text-[#ef4444]">*</span>
                    </label>
                    <select
                      value={reportRoom}
                      onChange={e => setReportRoom(e.target.value)}
                      className="w-full rounded-md bg-[#0f172a] border-[#334155] text-[#f8fafc] shadow-sm focus:border-[#10b981] border p-2 text-sm"
                    >
                      {rooms.map(r => (
                        <option key={r.id} value={r.number}>Phòng {r.number}</option>
                      ))}
                      <option value="Thang máy">Thang máy</option>
                      <option value="Khu vực chung">Khu vực chung</option>
                      <option value="Hệ thống điện">Hệ thống điện</option>
                      <option value="Khác">Khác/Ngoại cảnh</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">
                      Nội dung bảo trì <span className="text-[#ef4444]">*</span>
                    </label>
                    <input
                      type="text"
                      value={reportTitle}
                      onChange={e => setReportTitle(e.target.value)}
                      required
                      placeholder="Ví dụ: Sửa điều hòa phòng, Thay vòi nước chậu rửa..."
                      className="w-full rounded-md bg-[#0f172a] border-[#334155] text-[#f8fafc] shadow-sm focus:border-[#10b981] border p-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">
                      Mô tả thực trạng hỏng hóc & Kết quả <span className="text-[#ef4444]">*</span>
                    </label>
                    <textarea
                      value={reportDesc}
                      onChange={e => setReportDesc(e.target.value)}
                      required
                      rows={4}
                      placeholder="Ghi nhận rõ ràng: Tình trạng hỏng trước đó (Ví dụ: Block điều hòa hỏng tụ), biện pháp xử lý và kết quả (Đã hàn ống đồng, nạp gas, chạy lạnh buốt ổn định)..."
                      className="w-full rounded-md bg-[#0f172a] border-[#334155] text-[#f8fafc] shadow-sm focus:border-[#10b981] border p-2 text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" variant="success" disabled={isSubmittingReport}>
                      {isSubmittingReport ? "Đang lưu..." : "Lưu báo cáo hoàn thành"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setShowReportForm(false)}>
                      Hủy bỏ
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {isLoadingReports ? (
            <div className="text-center py-12">
              <span className="text-sm text-[#94a3b8] italic">Đang tải danh sách báo cáo...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 bg-[#1e293b]/50 rounded-xl border border-dashed border-[#334155]">
              <FileText className="mx-auto h-12 w-12 text-[#334155] mb-3" />
              <p className="text-[#94a3b8] font-medium">Chưa có biên bản Báo cáo bảo trì nào được ghi nhận.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((rep: any) => (
                <Card key={rep.id} className="hover:border-[#10b981]/40 border-t-2 border-t-[#10b981] transition-all bg-[#111e2e]/50">
                  <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Badge variant="success" className="bg-[#10b981]/20 text-[#10b981] px-2.5 py-0.5 text-[11px] font-bold">
                          Phòng {rep.roomNumber}
                        </Badge>
                        <span className="text-[10px] text-[#64748b] font-mono">
                          {new Date(rep.createdAt || '').toLocaleString('vi-VN')}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-[#f8fafc] text-sm mt-3">{rep.title}</h4>
                      
                      <div className="mt-2 bg-[#0f172a]/70 p-3 rounded-lg border border-[#334155]/40">
                        <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1">Mô tả thực trạng:</p>
                        <p className="text-xs text-[#cbd5e1] leading-relaxed whitespace-pre-wrap">{rep.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
