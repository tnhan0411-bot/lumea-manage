import React, { useState, useEffect } from 'react';
import { Card, CardContent, Badge, Button } from './ui';
import { Sparkles, DollarSign, Download, ArrowUpRight, Calculator, RefreshCw, BarChart3 } from 'lucide-react';
import { useAppContext } from '../lib/context';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function AIFinancialReport() {
  const { invoices, expenses } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [periodMode, setPeriodMode] = useState<'month' | 'quarter'>('quarter');
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7)); // Default current month YYYY-MM
  const [quarterStr, setQuarterStr] = useState(`${new Date().getFullYear()}-Q${Math.floor(new Date().getMonth()/3) + 1}`);
  const [error, setError] = useState<string | null>(null);

  const activePeriod = periodMode === 'month' ? period : quarterStr;

  const currentYear = parseInt(activePeriod.split('-')[0]) || new Date().getFullYear();
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const pStr = `${currentYear}-${month.toString().padStart(2, '0')}`;
    let revenue = 0;
    let expense = 0;

    invoices.forEach((inv: any) => {
      if (inv.status === 'paid' && inv.month === pStr && inv.total) {
        revenue += Number(inv.total);
      }
    });

    expenses.forEach((exp: any) => {
      if (exp.date && exp.date.startsWith(pStr)) {
        expense += Number(exp.amount);
      }
    });

    return {
      name: `T${month}`,
      'Doanh thu': revenue,
      'Chi phí': expense
    };
  });

  const fetchAIReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai-financial-report`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({ invoices, expenses, period: activePeriod })
      });
      
      if (res.status === 404) {
        throw new Error(`Lỗi 404: Không tìm thấy đường dẫn API (/api/ai-financial-report). Nếu bạn đang xem qua link Share, vui lòng tạo lại link Share mới (Re-share).`);
      }
      
      if (res.status === 413) {
        throw new Error('Lỗi 413: Dữ liệu tải lên quá lớn');
      }
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Non-JSON response:", text);
        throw new Error(!res.ok ? `Lỗi kết nối API (${res.status} ${res.statusText}).` : 'Lỗi phản hồi từ máy chủ không phải JSON');
      }

      if (!res.ok) throw new Error(data.error || 'Lỗi lấy báo cáo AI');
      
      setReportData(data);
    } catch (err: any) {
      console.log("Chi tiết lỗi API:", err.response || err);
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIReport();
  }, [activePeriod]);

  const handleExport = () => {
    if (!reportData) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Báo cáo Tài chính - ${activePeriod}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1 { color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px; }
            .card { border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; background: #f8fafc; }
            .card h3 { margin: 0 0 10px 0; font-size: 14px; color: #64748b; }
            .card p { margin: 0; font-size: 24px; font-weight: bold; }
            .text-red { color: #ef4444; }
            .text-green { color: #10b981; }
            .text-blue { color: #3b82f6; }
            .text-orange { color: #f59e0b; }
            .ai-box { margin-top: 30px; padding: 20px; border-radius: 8px; background: #eff6ff; border: 1px solid #bfdbfe; }
            .ai-box h2 { margin-top: 0; color: #1e40af; font-size: 18px; }
            .ai-box p { line-height: 1.6; color: #1e3a8a; }
          </style>
        </head>
        <body>
          <h1>Báo Cáo Tài Chính Hộ Kinh Doanh - Kỳ: ${activePeriod}</h1>
          <div class="grid">
            <div class="card">
              <h3>Tổng Doanh Thu</h3>
              <p class="text-blue">${reportData.grossRevenue.toLocaleString('vi-VN')} đ</p>
            </div>
            <div class="card">
              <h3>Tổng Chi Phí</h3>
              <p class="text-orange">${reportData.totalExpense?.toLocaleString('vi-VN') || 0} đ</p>
            </div>
            <div class="card">
              <h3>Doanh Thu Lũy Kế YTD</h3>
              <p class="text-purple" style="color: #8b5cf6;">${reportData.ytdRevenue.toLocaleString('vi-VN')} đ</p>
            </div>
            <div class="card">
              <h3>Thuế GTGT (5%)</h3>
              <p class="text-red">${reportData.vatTax.toLocaleString('vi-VN')} đ</p>
            </div>
            <div class="card">
              <h3>Thuế TNCN (2%)</h3>
              <p class="text-red">${reportData.pitTax.toLocaleString('vi-VN')} đ</p>
            </div>
            <div class="card">
              <h3>Lợi Nhuận Ròng</h3>
              <p class="text-green">${reportData.netRevenue.toLocaleString('vi-VN')} đ</p>
            </div>
          </div>
          <div class="ai-box">
            <h2>Góc Nhìn Tài Chính (AI CFO)</h2>
            <p>${reportData.insights}</p>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#f8fafc] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#38bdf8]" />
            Báo cáo Tài chính AI
          </h2>
          <p className="text-sm text-[#94a3b8]">Tự động tổng hợp và phân tích doanh thu, chi phí hộ kinh doanh</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-1 flex">
            <button 
              onClick={() => setPeriodMode('month')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${periodMode === 'month' ? "bg-[#38bdf8]/20 text-[#38bdf8]" : "text-[#94a3b8] hover:text-[#f8fafc]"}`}
            >
              Tháng
            </button>
            <button 
              onClick={() => setPeriodMode('quarter')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${periodMode === 'quarter' ? "bg-[#38bdf8]/20 text-[#38bdf8]" : "text-[#94a3b8] hover:text-[#f8fafc]"}`}
            >
              Quý
            </button>
          </div>

          {periodMode === 'month' ? (
            <input 
              type="month" 
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="bg-[#0f172a] border border-[#334155] text-[#f8fafc] px-3 py-1.5 rounded-xl text-sm outline-none focus:border-[#38bdf8]"
            />
          ) : (
            <select 
              value={quarterStr}
              onChange={e => setQuarterStr(e.target.value)}
              className="bg-[#0f172a] border border-[#334155] text-[#f8fafc] px-3 py-1.5 rounded-xl text-sm outline-none focus:border-[#38bdf8]"
            >
              {[0,1,2,3,4].map(y => {
                 const year = new Date().getFullYear() - y;
                 return [1,2,3,4].map(q => (
                    <option key={`${year}-Q${q}`} value={`${year}-Q${q}`}>{year} - Quý {q}</option>
                 ));
              })}
            </select>
          )}

          <Button onClick={fetchAIReport} disabled={loading} className="bg-[#1e293b] hover:bg-[#334155] text-[#f8fafc] border border-[#334155] h-9">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button onClick={handleExport} disabled={!reportData || loading} className="bg-[#38bdf8] text-[#0f172a] hover:bg-[#0284c7] h-9">
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {reportData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Card className="bg-[#0f172a]/50 border-[#334155]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-[#38bdf8]/10 text-[#38bdf8]">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <Badge variant="default" className="border-[#38bdf8]/30 text-[#38bdf8]">Gross</Badge>
                </div>
                <h3 className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider mb-1">Tổng Doanh Thu</h3>
                <div className="text-xl lg:text-2xl font-bold text-[#f8fafc]">{reportData.grossRevenue.toLocaleString('vi-VN')}</div>
              </CardContent>
            </Card>

            <Card className="bg-[#0f172a]/50 border-[#f59e0b]/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#f59e0b]/5 blur-2xl rounded-full"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-[#f59e0b]/10 text-[#f59e0b]">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <Badge variant="default" className="border-[#f59e0b]/30 text-[#f59e0b]">Exp</Badge>
                </div>
                <h3 className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider mb-1">Tổng Chi Phí</h3>
                <div className="text-xl lg:text-2xl font-bold text-[#f59e0b]">{reportData.totalExpense?.toLocaleString('vi-VN') || 0}</div>
              </CardContent>
            </Card>

            <Card className="bg-[#0f172a]/50 border-[#8b5cf6]/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#8b5cf6]/5 blur-2xl rounded-full"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6]">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <Badge variant="default" className="border-[#8b5cf6]/30 text-[#8b5cf6]">YTD</Badge>
                </div>
                <h3 className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider mb-1">Doanh Thu YTD</h3>
                <div className="text-xl lg:text-2xl font-bold text-[#8b5cf6]">{reportData.ytdRevenue.toLocaleString('vi-VN')}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#0f172a]/50 border-[#ef4444]/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#ef4444]/5 blur-2xl rounded-full"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-[#ef4444]/10 text-[#ef4444]">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <Badge variant="default" className="border-[#ef4444]/30 text-[#ef4444]">5%</Badge>
                </div>
                <h3 className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider mb-1">Thuế GTGT (VAT)</h3>
                <div className="text-xl lg:text-2xl font-bold text-[#ef4444]">{reportData.vatTax.toLocaleString('vi-VN')}</div>
              </CardContent>
            </Card>

            <Card className="bg-[#0f172a]/50 border-[#ef4444]/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#ef4444]/5 blur-2xl rounded-full"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-[#ef4444]/10 text-[#ef4444]">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <Badge variant="default" className="border-[#ef4444]/30 text-[#ef4444]">2%</Badge>
                </div>
                <h3 className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider mb-1">Thuế TNCN (PIT)</h3>
                <div className="text-xl lg:text-2xl font-bold text-[#ef4444]">{reportData.pitTax.toLocaleString('vi-VN')}</div>
              </CardContent>
            </Card>

            <Card className="bg-[#0f172a]/50 border-[#10b981]/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#10b981]/5 blur-2xl rounded-full"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-[#10b981]/10 text-[#10b981]">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <Badge variant="default" className="border-[#10b981]/30 text-[#10b981]">Net</Badge>
                </div>
                <h3 className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider mb-1">Lợi Nhuận Ròng</h3>
                <div className="text-xl lg:text-2xl font-bold text-[#10b981]">{reportData.netRevenue.toLocaleString('vi-VN')}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#0f172a] border-[#334155]">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-[#38bdf8]" />
                <h3 className="text-lg font-bold text-[#f8fafc]">Biểu đồ Doanh thu & Chi phí Năm {currentYear}</h3>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#94a3b8" 
                      tick={{ fill: '#94a3b8', fontSize: 12 }} 
                      axisLine={{ stroke: '#334155' }}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      tick={{ fill: '#94a3b8', fontSize: 12 }} 
                      axisLine={{ stroke: '#334155' }}
                      tickLine={false}
                      tickFormatter={(value) => `${(value / 1000000).toLocaleString('vi-VN')}M`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                      formatter={(value: number) => [`${value.toLocaleString('vi-VN')} đ`, undefined]}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="Doanh thu" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="Chi phí" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] border-[#38bdf8]/20 shadow-lg shadow-[#38bdf8]/5">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#38bdf8]/20 rounded-lg">
                  <Sparkles className="w-6 h-6 text-[#38bdf8]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#f8fafc]">AI Insights - Phân Tích Tài Chính</h3>
                  <p className="text-sm text-[#94a3b8]">Tư vấn từ Giám đốc tài chính ảo (Gemini AI)</p>
                </div>
              </div>
              <div className="prose prose-invert max-w-none text-[#cbd5e1] leading-relaxed">
                {reportData.insights.split('\n').map((line: string, i: number) => (
                  <p key={i} className={line.trim() ? "mb-2" : "mb-0"}>{line}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
