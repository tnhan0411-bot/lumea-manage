import React, { useState } from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardHeader, CardContent, Badge, Button } from './ui';
import { CreditCard, Plus, Trash2, Calendar, DollarSign, Tag, FileText, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';

const EXPENSE_CATEGORIES = [
  { id: 'salary', label: 'Lương nhân sự', color: 'text-blue-400 bg-blue-400/10' },
  { id: 'cleaning', label: 'Dịch vụ vệ sinh', color: 'text-purple-400 bg-purple-400/10' },
  { id: 'tools', label: 'Mua công cụ/dụng cụ', color: 'text-amber-400 bg-amber-400/10' },
  { id: 'operation', label: 'Chi phí vận hành khác', color: 'text-emerald-400 bg-emerald-400/10' },
  { id: 'maintenance', label: 'Chi phí bảo trì/sửa chữa', color: 'text-rose-400 bg-rose-400/10' },
];

export function Expenses() {
  const { expenses, addExpense, deleteExpense, updateExpense } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const [category, setCategory] = useState('salary');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    if (editingExpenseId) {
      updateExpense(editingExpenseId, {
        category: category as any,
        amount: parseFloat(amount),
        date,
        description
      });
      setEditingExpenseId(null);
    } else {
      addExpense({
        id: `exp-${Date.now()}`,
        category: category as any,
        amount: parseFloat(amount),
        date,
        description
      });
    }

    setAmount('');
    setDescription('');
    setShowAddForm(false);
  };

  const handleEdit = (exp: any) => {
    setEditingExpenseId(exp.id);
    setCategory(exp.category);
    setAmount(exp.amount.toString());
    setDate(exp.date);
    setDescription(exp.description);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingExpenseId(null);
    setAmount('');
    setDescription('');
    setCategory('salary');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const getCategoryLabel = (catId: string) => {
    return EXPENSE_CATEGORIES.find(c => c.id === catId)?.label || catId;
  };

  const getCategoryColor = (catId: string) => {
    return EXPENSE_CATEGORIES.find(c => c.id === catId)?.color || 'text-gray-400 bg-gray-400/10';
  };

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc]">Quản lý Chi phí</h1>
          <p className="text-[#94a3b8] text-sm">Theo dõi các khoản chi lương, vệ sinh, vật dụng...</p>
        </div>
        <Button onClick={showAddForm ? handleCancel : () => setShowAddForm(true)} variant={showAddForm ? "outline" : "primary"}>
          {showAddForm ? 'Hủy' : (
            <div className="flex items-center gap-2">
              <Plus size={18} />
              Nhập chi phí mới
            </div>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader title="Tổng quan chi phí" />
          <CardContent className="space-y-6">
            <div className="p-4 bg-[#1e293b]/50 rounded-xl border border-[#334155]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#94a3b8] text-sm">Tổng chi tiêu</span>
                <DollarSign size={18} className="text-[#38bdf8]" />
              </div>
              <div className="text-2xl font-bold text-[#f8fafc]">
                {totalExpense.toLocaleString()} <span className="text-sm font-normal text-[#94a3b8]">VND</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Phân bổ theo hạng mục</h4>
              {EXPENSE_CATEGORIES.map(cat => {
                const catTotal = expenses.filter(e => e.category === cat.id).reduce((sum, e) => sum + e.amount, 0);
                const percentage = totalExpense > 0 ? (catTotal / totalExpense) * 100 : 0;
                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#94a3b8]">{cat.label}</span>
                      <span className="text-[#f8fafc] font-medium">{catTotal.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1e293b] rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-1000", cat.color.split(' ')[1])}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          {showAddForm && (
            <Card className="bg-[#1e293b]/50 border-dashed border-[#38bdf8]/50 animate-in fade-in slide-in-from-top-4">
              <CardContent className="p-6">
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#94a3b8]">Hạng mục chi</label>
                      <select 
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full rounded-lg bg-[#0f172a] border-[#334155] text-[#f8fafc] p-2.5 text-sm focus:ring-[#38bdf8] focus:border-[#38bdf8] border"
                      >
                        {EXPENSE_CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#94a3b8]">Ngày chi</label>
                      <input 
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full rounded-lg bg-[#0f172a] border-[#334155] text-[#f8fafc] p-2.5 text-sm focus:ring-[#38bdf8] focus:border-[#38bdf8] border"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#94a3b8]">Số tiền (VND)</label>
                      <div className="relative">
                        <input 
                          type="number"
                          value={amount}
                          onChange={e => setAmount(e.target.value)}
                          className="w-full rounded-lg bg-[#0f172a] border-[#334155] text-[#f8fafc] p-2.5 pl-10 text-sm focus:ring-[#38bdf8] focus:border-[#38bdf8] border"
                          placeholder="Ví dụ: 5000000"
                        />
                        <DollarSign className="absolute left-3 top-2.5 text-[#64748b]" size={18} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#94a3b8]">Ghi chú / Mô tả</label>
                      <input 
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full rounded-lg bg-[#0f172a] border-[#334155] text-[#f8fafc] p-2.5 text-sm focus:ring-[#38bdf8] focus:border-[#38bdf8] border"
                        placeholder="Mua công cụ dọn dẹp, Trả lương tháng 4..."
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    {editingExpenseId ? 'Cập nhật khoản chi' : 'Lưu khoản chi'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#64748b] uppercase tracking-wider mb-2">Lịch sử chi gần đây</h3>
            {expenses.length === 0 ? (
              <div className="text-center py-12 bg-[#1e293b]/50 rounded-xl border border-dashed border-[#334155]">
                <FileText className="mx-auto h-12 w-12 text-[#334155] mb-3" />
                <p className="text-[#94a3b8] font-medium">Chưa có dữ liệu chi phí nào.</p>
              </div>
            ) : (
              expenses.map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-4 bg-[#1e293b]/30 rounded-xl border border-[#334155] hover:bg-[#1e293b]/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2.5 rounded-lg shrink-0", getCategoryColor(exp.category))}>
                      <Tag size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-[#f8fafc]">{getCategoryLabel(exp.category)}</h4>
                        <span className="text-xs text-[#64748b]">|</span>
                        <span className="text-xs text-[#94a3b8] flex items-center gap-1">
                          <Calendar size={12} /> {exp.date}
                        </span>
                      </div>
                      <p className="text-[#64748b] text-sm">{exp.description || 'Không có mô tả'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#f8fafc]">{exp.amount.toLocaleString()} VND</span>
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleEdit(exp)}
                        className="p-2 text-[#64748b] hover:text-[#38bdf8] transition-colors opacity-0 group-hover:opacity-100"
                        title="Sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteExpense(exp.id)}
                        className="p-2 text-[#64748b] hover:text-[#ef4444] transition-colors opacity-0 group-hover:opacity-100"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
