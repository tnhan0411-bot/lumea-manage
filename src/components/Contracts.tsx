import React, { useState } from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardContent, Badge, Button } from './ui';
import { FileText, Calendar, DollarSign, User, Plus, Search, FileDown, Download, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export function Contracts() {
  const { contracts, rooms, tenants, role, addContract, deleteContract, updateContract, addTenant, updateRoom, addInvoice } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // New Contract Form State
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [roomId, setRoomId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deposit, setDeposit] = useState('');
  const [rent, setRent] = useState('');
  const [visaExpiry, setVisaExpiry] = useState('');

  const [editContractId, setEditContractId] = useState<string | null>(null);
  const [newAttachmentName, setNewAttachmentName] = useState('');

  const handleEdit = (contract: any) => {
    const tenant = tenants.find(t => t.id === contract.tenantId);
    setEditContractId(contract.id);
    setTenantName(tenant?.name || '');
    setTenantPhone(tenant?.phone || '');
    setVisaExpiry(tenant?.visaExpiry || '');
    setRoomId(contract.roomId);
    setStartDate(contract.startDate);
    setEndDate(contract.endDate);
    setDeposit(contract.deposit.toString());
    setRent(contract.monthlyRent.toString());
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editContractId) {
      updateContract(editContractId, {
        startDate,
        endDate,
        deposit: Number(deposit),
        monthlyRent: Number(rent),
      });
      
      const contract = contracts.find(c => c.id === editContractId);
      if (contract && contract.tenantId) {
        updateTenant(contract.tenantId, {
          visaExpiry: visaExpiry || undefined,
          name: tenantName,
          phone: tenantPhone
        });
      }

      setEditContractId(null);
      setShowForm(false);
      resetForm();
    } else {
      handleCreate(e);
    }
  };

  const resetForm = () => {
    setTenantName('');
    setTenantPhone('');
    setRoomId('');
    setStartDate('');
    setEndDate('');
    setDeposit('');
    setRent('');
    setVisaExpiry('');
  };

  const displayContracts = contracts.filter(c => {
    const tenant = tenants.find(t => t.id === c.tenantId);
    const room = rooms.find(r => r.id === c.roomId);
    return (
      tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room?.number.includes(searchTerm)
    );
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newTenantId = `t-${Date.now()}`;
    const newContractId = `c-${Date.now()}`;
    const selectedRoom = rooms.find(r => r.id === roomId);

    // 1. Create a dummy tenant record for this contract
    addTenant({
      id: newTenantId,
      name: tenantName,
      phone: tenantPhone,
      email: '',
      roomId: roomId,
      contractStart: startDate,
      contractEnd: endDate,
      visaExpiry: visaExpiry || undefined
    });

    // 2. Create the contract
    addContract({
      id: newContractId,
      roomId,
      tenantId: newTenantId,
      startDate,
      endDate,
      deposit: Number(deposit),
      monthlyRent: Number(rent),
      status: 'active',
      attachments: []
    });

    // 3. Update room status
    updateRoom(roomId, { 
      status: 'occupied',
      leaseStart: startDate,
      leaseEnd: endDate
    });

    // 4. Create first invoice (Hóa đơn thu tiền)
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    addInvoice({
      id: `inv-${Date.now()}`,
      roomId: roomId,
      tenantId: newTenantId,
      month: currentMonth,
      rent: Number(rent),
      electricity: 0,
      water: 0,
      other: 0,
      total: Number(rent),
      status: 'pending',
      dueDate: `${currentMonth}-05`
    });

    setShowForm(false);
    resetForm();
  };

  const handleAddAttachment = (contractId: string) => {
    if (!newAttachmentName) return;
    const contract = contracts.find(c => c.id === contractId);
    if (contract) {
      const newAttachment = {
        id: `att-${Date.now()}`,
        name: newAttachmentName,
        url: '#',
        type: 'contract' as const,
        uploadedAt: new Date().toISOString().split('T')[0]
      };
      updateContract(contractId, {
        attachments: [...contract.attachments, newAttachment]
      });
      setNewAttachmentName('');
    }
  };

  const handleDeleteAttachment = (contractId: string, attachmentId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (contract) {
      updateContract(contractId, {
        attachments: contract.attachments.filter(a => a.id !== attachmentId)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#f8fafc]">Quản lý Hợp đồng & Hồ sơ</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo tên/phòng..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-xl pl-10 pr-4 py-2 text-sm text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
            />
          </div>
          {role === 'landlord' && (
            <Button className="shrink-0" onClick={() => setShowForm(!showForm)}>
              <Plus size={18} className="mr-1" /> {showForm ? 'Hủy' : 'Tạo mới'}
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <Card className="bg-[#38bdf8]/5 border-[#38bdf8]/20">
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {!editContractId && (
                    <>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#94a3b8] mb-1">Tên người thuê</label>
                        <input type="text" value={tenantName} onChange={e => setTenantName(e.target.value)} required className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-sm text-[#f8fafc]" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#94a3b8] mb-1">Số điện thoại</label>
                        <input type="text" value={tenantPhone} onChange={e => setTenantPhone(e.target.value)} required className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-sm text-[#f8fafc]" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#94a3b8] mb-1">Số phòng</label>
                        <select value={roomId} onChange={e => setRoomId(e.target.value)} required className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-sm text-[#f8fafc]">
                          <option value="">Chọn phòng...</option>
                          {rooms.map(r => <option key={r.id} value={r.id}>Phòng {r.number}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#94a3b8] mb-1">Ngày bắt đầu</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-sm text-[#f8fafc]" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#94a3b8] mb-1">Ngày kết thúc</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-sm text-[#f8fafc]" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#94a3b8] mb-1">Tiền cọc (VNĐ)</label>
                    <input type="number" value={deposit} onChange={e => setDeposit(e.target.value)} required className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-sm text-[#f8fafc]" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#94a3b8] mb-1">Hết hạn Visa (Stam)</label>
                    <input type="date" value={visaExpiry} onChange={e => setVisaExpiry(e.target.value)} className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-sm text-[#f8fafc]" />
                  </div>
               </div>
               <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
                  <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditContractId(null); resetForm(); }}>Hủy bỏ</Button>
                  <Button type="submit" variant="primary">{editContractId ? 'Cập nhật hợp đồng' : 'Xác nhận tạo hợp đồng'}</Button>
               </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {displayContracts.map(contract => {
          const room = rooms.find(r => r.id === contract.roomId);
          const tenant = tenants.find(t => t.id === contract.tenantId);

          return (
            <Card key={contract.id} className="hover:border-[#334155] transition-colors bg-[#1e293b]/50 group">
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
                          <p className="text-sm text-[#94a3b8]">{tenant?.email || 'N/A'} • {tenant?.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={contract.status === 'active' ? 'success' : 'danger'}>
                          {contract.status === 'active' ? 'Đang hiệu lực' : 'Đã hết hạn'}
                        </Badge>
                        {role === 'landlord' && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(contract)} className="p-2 text-[#94a3b8] hover:text-[#38bdf8] transition-colors">
                               <FileText size={16} />
                            </button>
                            <button onClick={() => deleteContract(contract.id)} className="p-2 text-[#94a3b8] hover:text-[#ef4444] transition-colors">
                               <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
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
                        <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider mb-1">Hết hạn Visa</p>
                        <p className={cn("text-sm flex items-center gap-2 font-bold", tenant?.visaExpiry ? "text-[#f8fafc]" : "text-[#64748b] italic")}>
                          <User size={14} className={cn(tenant?.visaExpiry ? "text-[#f59e0b]" : "text-[#64748b]")} /> 
                          {tenant?.visaExpiry || 'Chưa cập nhật'}
                        </p>
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
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-[#94a3b8] hover:text-[#38bdf8] p-1">
                              <Download size={16} />
                            </button>
                            {role === 'landlord' && (
                              <button 
                                onClick={() => handleDeleteAttachment(contract.id, file.id)}
                                className="text-[#94a3b8] hover:text-[#ef4444] p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {contract.attachments.length === 0 && (
                        <div className="text-center py-6 border border-dashed border-[#334155] rounded-lg">
                          <p className="text-xs text-[#94a3b8] italic">Không có file nào</p>
                        </div>
                      )}
                      
                      {role === 'landlord' && (
                        <div className="pt-2 flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Tên file mới..."
                            value={editContractId === contract.id ? newAttachmentName : ''}
                            onChange={(e) => {
                              setEditContractId(contract.id);
                              setNewAttachmentName(e.target.value);
                            }}
                            className="flex-1 bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-1.5 text-xs text-[#f8fafc] outline-none"
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8"
                            onClick={() => handleAddAttachment(contract.id)}
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                      )}
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
