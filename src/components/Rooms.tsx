import React from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardContent, Badge, Button } from './ui';
import { User, DoorOpen, Settings, Check, Clock } from 'lucide-react';
import { Room, cn } from '../lib/utils';

export function RoomList() {
  const { rooms, tenants, issues } = useAppContext();

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'occupied': return 'border-l-4 border-l-[#38bdf8] border-[#334155]';
      case 'available': return 'border-l-4 border-l-[#10b981] border-[#334155]';
      case 'maintenance': return 'border-l-4 border-l-[#ef4444] border-[#334155]';
    }
  };

  const getStatusBadge = (status: Room['status']) => {
    switch (status) {
      case 'occupied': return <span className="bg-[#38bdf8]/10 text-[#38bdf8] px-2 py-0.5 rounded text-[10px] uppercase font-bold">Đang thuê</span>;
      case 'available': return <span className="bg-[#10b981]/10 text-[#10b981] px-2 py-0.5 rounded text-[10px] uppercase font-bold">Trống</span>;
      case 'maintenance': return <Badge variant="danger">Bảo trì</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#f8fafc]">Quản lý Phòng</h1>
        <Button>Thêm phòng</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {rooms.map(room => {
          const tenant = tenants.find(t => t.roomId === room.id);
          const roomIssues = issues.filter(i => i.roomId === room.id && i.status !== 'resolved');

          return (
            <Card key={room.id} className={cn("transition-all hover:bg-[#334155]/20 bg-[#1e293b] flex flex-col justify-between", getStatusColor(room.status))}>
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-[#f8fafc]"> {/* Use P instead of DoorOpen for Elegant Dark style */}
                    P.{room.number.substring(1)} {/* Adapt number formatting */}
                  </h3>
                  {getStatusBadge(room.status)}
                </div>
                
                <div className="flex-1 mt-2">
                  <p className="font-medium text-[13px] text-[#f8fafc]">
                    {tenant ? tenant.name : <span className="text-[#94a3b8] italic">Sẵn sàng</span>}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  {roomIssues.length > 0 && (
                    <div className="w-6 h-6 rounded bg-white/5 border border-[#ef4444] text-[#ef4444] flex items-center justify-center text-xs" title={`${roomIssues.length} sự cố`}>
                      🛠️
                    </div>
                  )}
                  {room.status === 'occupied' && roomIssues.length === 0 && (
                    <div className="w-6 h-6 rounded bg-white/5 border border-[#f59e0b] text-[#f59e0b] flex items-center justify-center text-xs" title="Lịch dọn dẹp">
                      🧹
                    </div>
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
