import React, { useState, useEffect } from 'react';
import { Card, CardContent, Badge, Button } from './ui';
import { Sparkles, DollarSign, Download, ArrowUpRight, Calculator, RefreshCw } from 'lucide-react';
import { useAppContext } from '../lib/context';

export function AIFinancialReport() {
  const { invoices } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7)); // Default current month YYYY-MM
  const [error, setError] = useState<string | null>(null);

  const fetchAIReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-financial-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoices, period })
      });
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Non-JSON response:", text);
        throw new Error(!res.ok ? `Lỗi kết nối API (${res.status} ${res.statusText}). Có thể do payload quá lớn hoặc server bị lỗi.` : 'Lỗi phản hồi từ máy chủ không phải JSON');
      }

      if (!res.ok) throw new Error(data.error || 'Lỗi lấy báo cáo AI');
      
      setReportData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIReport();
  }, [period]);

  const handleExport = () => {
    if (!reportData) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Báo cáo Tài chính - ${period}</title>
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
            .ai-box { margin-top: 30px; padding: 20px; border-radius: 8px; background: #eff6ff; border: 1px solid #bfdbfe; }
            .ai-box h2 { margin-top: 0; color: #1e40af; font-size: 18px; }
            .ai-box p { line-height: 1.6; color: #1e3a8a; }
          </style>
        </head>
        <body>
          <h1>Báo Cáo Tài Chính Hộ Kinh Doanh - ${period}</h1>
          <div class="grid">
            <div class="card">
              <h3>Tổng Doanh Thu Tháng</h3>
              <p class="text-blue">${reportData.grossRevenue.toLocaleString('vi-VN')} đ</p>
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
              <h3>Doanh Thu Ròng</h3>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#f8fafc] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#38bdf8]" />
            Báo cáo Tài chính AI
          </h2>
          <p className="text-sm text-[#94a3b8]">Tự động tổng hợp và phân tích doanh thu hộ kinh doanh</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="month" 
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="bg-[#0f172a] border border-[#334155] text-[#f8fafc] px-3 py-2 rounded-xl text-sm outline-none focus:border-[#38bdf8]"
          />
          <Button onClick={fetchAIReport} disabled={loading} className="bg-[#1e293b] hover:bg-[#334155] text-[#f8fafc] border border-[#334155]">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button onClick={handleExport} disabled={!reportData || loading} className="bg-[#38bdf8] text-[#0f172a] hover:bg-[#0284c7]">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-[#0f172a]/50 border-[#334155]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-[#38bdf8]/10 text-[#38bdf8]">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="border-[#38bdf8]/30 text-[#38bdf8]">Gross</Badge>
                </div>
                <h3 className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider mb-1">Tổng Doanh Thu Tháng</h3>
                <div className="text-2xl font-bold text-[#f8fafc]">{reportData.grossRevenue.toLocaleString('vi-VN')} <span className="text-sm text-[#94a3b8] font-normal">đ</span></div>
              </CardContent>
            </Card>

            <Card className="bg-[#0f172a]/50 border-[#8b5cf6]/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#8b5cf6]/5 blur-2xl rounded-full"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6]">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="border-[#8b5cf6]/30 text-[#8b5cf6]">YTD</Badge>
                </div>
                <h3 className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider mb-1">Doanh Thu Lũy Kế</h3>
                <div className="text-2xl font-bold text-[#8b5cf6]">{reportData.ytdRevenue.toLocaleString('vi-VN')} <span className="text-sm text-[#8b5cf6]/70 font-normal">đ</span></div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#0f172a]/50 border-[#ef4444]/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#ef4444]/5 blur-2xl rounded-full"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-[#ef4444]/10 text-[#ef4444]">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="border-[#ef4444]/30 text-[#ef4444]">5%</Badge>
                </div>
                <h3 className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider mb-1">Thuế GTGT (VAT)</h3>
                <div className="text-2xl font-bold text-[#ef4444]">{reportData.vatTax.toLocaleString('vi-VN')} <span className="text-sm text-[#ef4444]/70 font-normal">đ</span></div>
              </CardContent>
            </Card>

            <Card className="bg-[#0f172a]/50 border-[#f59e0b]/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#f59e0b]/5 blur-2xl rounded-full"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-[#f59e0b]/10 text-[#f59e0b]">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="border-[#f59e0b]/30 text-[#f59e0b]">2%</Badge>
                </div>
                <h3 className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider mb-1">Thuế TNCN (PIT)</h3>
                <div className="text-2xl font-bold text-[#f59e0b]">{reportData.pitTax.toLocaleString('vi-VN')} <span className="text-sm text-[#f59e0b]/70 font-normal">đ</span></div>
              </CardContent>
            </Card>

            <Card className="bg-[#0f172a]/50 border-[#10b981]/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#10b981]/5 blur-2xl rounded-full"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-[#10b981]/10 text-[#10b981]">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="border-[#10b981]/30 text-[#10b981]">Net</Badge>
                </div>
                <h3 className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider mb-1">Doanh Thu Ròng</h3>
                <div className="text-2xl font-bold text-[#10b981]">{reportData.netRevenue.toLocaleString('vi-VN')} <span className="text-sm text-[#10b981]/70 font-normal">đ</span></div>
              </CardContent>
            </Card>
          </div>

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
