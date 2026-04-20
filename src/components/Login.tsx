import React, { useState } from 'react';
import { useAppContext } from '../lib/context';
import { Card, CardContent } from './ui';
import { Building2, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export function Login() {
  const { login } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Artificial delay for better UX
    setTimeout(() => {
      const success = login(email, password);
      if (!success) {
        setError('Email hoặc mật khẩu không chính xác');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-[#38bdf8] text-[#0f172a] rounded-2xl mb-4 shadow-xl shadow-[#38bdf8]/10">
            <Building2 size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#f8fafc] tracking-tight">Lumea Nest</h1>
          <p className="text-[#94a3b8] mt-2">Hệ thống quản lý căn hộ dịch vụ cao cấp</p>
        </div>

        <Card className="border-[#334155] bg-[#1e293b]/50 backdrop-blur-xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg flex items-center gap-3 text-[#ef4444] text-sm animate-shake">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#94a3b8] ml-1">Email đăng nhập</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" size={18} />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-xl pl-10 pr-4 py-3 text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#38bdf8] focus:border-transparent transition-all"
                    placeholder="admin@lumea.vn"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#94a3b8] ml-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" size={18} />
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-xl pl-10 pr-4 py-3 text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#38bdf8] focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#0f172a] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#0f172a]/20 border-t-[#0f172a] rounded-full animate-spin"></div>
                ) : (
                  <>
                    Đăng nhập hệ thống <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-[#64748b]">
                  Gợi ý: admin1@lumea.vn / password123 (Chủ nhà) <br/>
                  tech@lumea.vn / password123 (Kỹ thuật)
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
