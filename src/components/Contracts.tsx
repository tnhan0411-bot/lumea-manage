import React, { useState } from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardContent, Badge, Button } from './ui';
import { FileText, Calendar, DollarSign, User, Plus, Search, FileDown, Download } from 'lucide-react';
import { format } from 'date-fns';

export function Contracts() {
  const { contracts, rooms, tenants, role } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const displayContracts = contracts.filter(c => {
    const tenant = tenants.find(t => t.id === c.tenantId);
    const room = rooms.find(r => r.id === c.roomId);
    return (
      tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room?.number.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#f8fafc]">Quản lý Hợp đồng</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo tên/phòng..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-lg pl-10 pr-4 py-2 text-sm text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
            />
          </div>
          <Button className="shrink-0"><Plus size={18} className="mr-1" /> Tạo mới</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {displayContracts.map(contract => {
          const room = rooms.find(r => r.id === contract.roomId);
          const tenant = tenants.find(t => t.id === contract.tenantId);

          return (
            <Card key={contract.id} className="hover:border-[#334155] transition-colors bg-[#1e293b]/50">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center font-bold text-xl">
                          {room?.number}
                        </div>
                        <div>
                          <h3 className="font-bold text-[#f8fafc] text-lg">{tenant?.name}</h3>
                          <p className="text-sm text-[#94a3b8]">{tenant?.email} • {tenant?.phone}</p>
                        </div>
                      </div>
                      <Badge variant={contract.status === 'active' ? 'success' : 'danger'}>
                        {contract.status === 'active' ? 'Đang hiệu lực' : 'Đã hết hạn'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-[#334155]/50">
                      <div>
                        <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider mb-1">Ngày bắt đầu</p>
                        <p className="text-sm text-[#f8fafc] flex items-center gap-2"><Calendar size={14} className="text-[#38bdf8]" /> {contract.startDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider mb-1">Ngày kết thúc</p>
                        <p className="text-sm text-[#f8fafc] flex items-center gap-2"><Calendar size={14} className="text-[#ef4444]" /> {contract.endDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider mb-1">Tiền cọc</p>
                        <p className="text-sm text-[#10b981] font-bold">{contract.deposit.toLocaleString()}đ</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider mb-1">Tiền thuê / tháng</p>
                        <p className="text-sm text-[#10b981] font-bold">{contract.monthlyRent.toLocaleString()}đ</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Attachments list */}
                  <div className="lg:w-80 space-y-3">
                    <h4 className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-2">
                       <FileText size={14} /> File đính kèm
                    </h4>
                    <div className="space-y-2">
                      {contract.attachments.map(file => (
                        <div key={file.id} className="group flex items-center justify-between p-3 rounded-lg bg-[#0f172a] border border-[#334155] hover:border-[#38bdf8] transition-all">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 rounded bg-[#38bdf8]/10 text-[#38bdf8]">
                              <FileText size={16} />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm text-[#f8fafc] font-medium truncate">{file.name}</p>
                              <p className="text-[10px] text-[#94a3b8]">{file.uploadedAt}</p>
                            </div>
                          </div>
                          <button className="text-[#94a3b8] hover:text-[#38bdf8] p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Download size={18} />
                          </button>
                        </div>
                      ))}
                      {contract.attachments.length === 0 && (
                        <div className="text-center py-6 border border-dashed border-[#334155] rounded-lg">
                          <p className="text-xs text-[#94a3b8] italic">Không có file nào</p>
                        </div>
                      )}
                      <Button variant="outline" size="sm" className="w-full border-dashed border-[#334155] text-[#94a3b8] mt-2">
                        + Thêm file đính kèm
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
