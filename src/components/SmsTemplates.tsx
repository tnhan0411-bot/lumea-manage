import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Button } from './ui';
import { MessageSquare, Save } from 'lucide-react';
import { useAppContext } from '../lib/context';

const DEFAULT_TEMPLATES = {
  rentReminder: 'Xin chào {TENANT_NAME}. Đây là nhắc nhở thanh toán tiền phòng {ROOM_NUMBER} tháng {MONTH}. Số tiền: {AMOUNT}đ. Vui lòng thanh toán trước ngày {DUE_DATE}.',
  moveIn: 'Xin chào {TENANT_NAME}, chúc mừng bạn đã chuyển vào phòng {ROOM_NUMBER} thành công. Chúc bạn một ngày tốt lành.',
  maintenance: 'Yêu cầu bảo trì phòng {ROOM_NUMBER} của bạn đã được tiếp nhận và xử lý vào lúc {DATE}.'
};

export function SmsTemplates() {
  const { role } = useAppContext();
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  
  if (role !== 'landlord') {
    return <div className="p-8 text-[#f8fafc]">Bạn không có quyền truy cập trang này.</div>;
  }

  const handleSave = () => {
    // In a real app this would save to the DB
    alert('Cấu hình SMS đã được lưu thành công!');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc] flex items-center gap-2">
            <MessageSquare className="text-[#38bdf8]" />
            Cấu hình mẫu tin nhắn SMS
          </h1>
          <p className="text-[#94a3b8] text-sm mt-1">Tuỳ chỉnh các mẫu tin nhắn sẽ được gửi tự động đến khách thuê.</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save size={18} /> Lưu cấu hình
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#1e293b]/50 border-[#334155]">
          <CardHeader title="Nhắc nhở thanh toán (Rent Reminder)" />
          <CardContent className="space-y-4">
            <div className="text-xs text-[#94a3b8] flex gap-2 flex-wrap">
              <span className="bg-[#0f172a] px-2 py-1 rounded border border-[#334155]">{`{TENANT_NAME}`}</span>
              <span className="bg-[#0f172a] px-2 py-1 rounded border border-[#334155]">{`{ROOM_NUMBER}`}</span>
              <span className="bg-[#0f172a] px-2 py-1 rounded border border-[#334155]">{`{MONTH}`}</span>
              <span className="bg-[#0f172a] px-2 py-1 rounded border border-[#334155]">{`{AMOUNT}`}</span>
              <span className="bg-[#0f172a] px-2 py-1 rounded border border-[#334155]">{`{DUE_DATE}`}</span>
            </div>
            <textarea
              value={templates.rentReminder}
              onChange={e => setTemplates({...templates, rentReminder: e.target.value})}
              className="w-full h-32 bg-[#0f172a] border-[#334155] rounded-lg p-3 text-sm text-[#f8fafc] focus:ring-2 focus:ring-[#38bdf8] outline-none resize-none"
            />
          </CardContent>
        </Card>

        <Card className="bg-[#1e293b]/50 border-[#334155]">
          <CardHeader title="Xác nhận nhận phòng (Move-in Confirmation)" />
          <CardContent className="space-y-4">
            <div className="text-xs text-[#94a3b8] flex gap-2 flex-wrap">
              <span className="bg-[#0f172a] px-2 py-1 rounded border border-[#334155]">{`{TENANT_NAME}`}</span>
              <span className="bg-[#0f172a] px-2 py-1 rounded border border-[#334155]">{`{ROOM_NUMBER}`}</span>
            </div>
            <textarea
              value={templates.moveIn}
              onChange={e => setTemplates({...templates, moveIn: e.target.value})}
              className="w-full h-32 bg-[#0f172a] border-[#334155] rounded-lg p-3 text-sm text-[#f8fafc] focus:ring-2 focus:ring-[#38bdf8] outline-none resize-none"
            />
          </CardContent>
        </Card>

        <Card className="bg-[#1e293b]/50 border-[#334155]">
          <CardHeader title="Cập nhật bảo trì (Maintenance Update)" />
          <CardContent className="space-y-4">
            <div className="text-xs text-[#94a3b8] flex gap-2 flex-wrap">
              <span className="bg-[#0f172a] px-2 py-1 rounded border border-[#334155]">{`{ROOM_NUMBER}`}</span>
              <span className="bg-[#0f172a] px-2 py-1 rounded border border-[#334155]">{`{DATE}`}</span>
            </div>
            <textarea
              value={templates.maintenance}
              onChange={e => setTemplates({...templates, maintenance: e.target.value})}
              className="w-full h-32 bg-[#0f172a] border-[#334155] rounded-lg p-3 text-sm text-[#f8fafc] focus:ring-2 focus:ring-[#38bdf8] outline-none resize-none"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
